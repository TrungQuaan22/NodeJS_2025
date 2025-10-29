/* eslint-disable @typescript-eslint/no-unused-vars */
import { checkSchema } from 'express-validator'
import { ErrorWithStatus } from '~/models/Errors'
import databasesService from '~/services/databases.services'
import usersService from '~/services/users.services'
import { verifyToken } from '~/utils/jwt'
import validate from '~/utils/validate'
import { Request } from 'express'
import { TokenPayload } from '~/models/request/authentication'
import { config } from 'dotenv'
config()

const loginValidationMiddleware = validate(
  checkSchema({
    email: {
      notEmpty: { errorMessage: 'Email is required' },
      isEmail: { errorMessage: 'Invalid email' },
      normalizeEmail: true,
      trim: true
    },
    password: {
      notEmpty: { errorMessage: 'Password is required' },
      trim: true,
      isLength: {
        options: { min: 6, max: 20 },
        errorMessage: 'Password must be between 6 and 20 characters long'
      }
    }
  })
)

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: { errorMessage: 'Name is required' }
    },
    email: {
      notEmpty: { errorMessage: 'Email is required' },
      isEmail: { errorMessage: 'Invalid email' },
      normalizeEmail: true,
      trim: true,
      custom: {
        options: async (value) => {
          const emailExists = await usersService.checkEmailExists(value)
          if (emailExists) {
            throw new ErrorWithStatus({ message: 'Email is already in use hahhaa', status: 401 })
          }
          return true
        }
      }
    },
    password: {
      notEmpty: { errorMessage: 'Password is required' },
      trim: true,
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Password must be 6-20 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
      }
    },
    confirm_password: {
      notEmpty: { errorMessage: 'Confirm Password is required' },
      trim: true,
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Confirm Password does not match Password')
          }
          return true
        }
      }
    }
  })
)
export const logoutValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: { errorMessage: 'Refresh token is required' },
        trim: true
      }
    },
    ['body']
  )
)
// Middleware to validate access token in Authorization header
// Require access token exists and valid
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: 'Authorization header is required' },
        custom: {
          options: async (value, { req }) => {
            const accessToken = value?.split(' ')[1]
            if (!accessToken) {
              throw new ErrorWithStatus({ message: 'Access token is required', status: 401 })
            }
            const decode_authorization = await verifyToken({
              token: accessToken,
              privateKey: process.env.JWT_ACCESS_TOKEN_SECRET as string
            }).catch((err) => null)
            req.decode_authorization = decode_authorization
            return true
          }
        }
      }
    },
    ['headers']
  )
)

//Require refresh token exists in database and valid in body
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: { errorMessage: 'Refresh token is required' },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const [decode_refresh, refresh_token] = await Promise.all([
              verifyToken({ token: value, privateKey: process.env.JWT_REFRESH_TOKEN_SECRET as string }).catch(
                (err) => null
              ),
              databasesService.refreshTokens.findOne({ token: value })
            ])

            if (!decode_refresh) {
              throw new ErrorWithStatus({ message: 'Invalid refresh token', status: 401 })
            }

            if (refresh_token === null) {
              throw new ErrorWithStatus({ message: 'Refresh token not found', status: 401 })
            }
            ;(req as Request).refresh_token_payload = decode_refresh as TokenPayload
            return true
          }
        }
      }
    },
    ['body']
  )
)
//Check verify token in body, decoded token will be stored in req.verify_token_payload
export const verifyTokenValidator = validate(
  checkSchema({
    verify_token: {
      notEmpty: { errorMessage: 'Verify token is required' },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const decode_verify_token = await verifyToken({
            token: value,
            privateKey: process.env.JWT_VERIFY_EMAIL_TOKEN_SECRET as string
          })
          if (!decode_verify_token) {
            throw new ErrorWithStatus({ message: 'Invalid verify token', status: 401 })
          }
          req.verify_token_payload = decode_verify_token
          return true
        }
      }
    }
  })
)

export const forgotPasswordVaildator = validate(
  checkSchema({
    email: {
      notEmpty: { errorMessage: 'Email is required' },
      isEmail: { errorMessage: 'Invalid email' },
      normalizeEmail: true,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databasesService.users.findOne({ email: value })
          if (!user) {
            throw new ErrorWithStatus({ message: 'Email not found', status: 404 })
          }
          ;(req as Request).user_id = user._id.toString()
          return true
        }
      }
    }
  })
)
export { loginValidationMiddleware }
