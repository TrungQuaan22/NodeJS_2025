/* eslint-disable @typescript-eslint/no-unused-vars */
import { checkSchema, ParamSchema } from 'express-validator'
import { ErrorWithStatus } from '~/models/Errors'
import databasesService from '~/services/databases.services'
import usersService from '~/services/users.services'
import { verifyToken } from '~/utils/jwt'
import validate from '~/utils/validate'
import { NextFunction, Request, Response } from 'express'
import { TokenPayload } from '~/models/request/user.req'
import { config } from 'dotenv'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/models/schemas/users.schema'
config()

const passwordSchema: ParamSchema = {
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
}
const confirmPasswordSchema: ParamSchema = {
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
const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({ message: 'Forgot password token is required', status: 401 })
      }
      try {
        const decode_forgot_password_token = await verifyToken({
          token: value,
          privateKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_SECRET as string
        })
        const { user_id } = decode_forgot_password_token
        console.log('user_id in validator', user_id)

        const user = await databasesService.users.findOne({ _id: new ObjectId(user_id) })
        if (!user || user.forgot_password_token !== value) {
          throw new ErrorWithStatus({ message: 'Invalid forgot password token', status: 401 })
        }
        req.user_id = user_id
      } catch (err) {
        if (err instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({ message: 'Invalid forgot password token', status: 401 })
        }
        return true
      }
    }
  }
}
const loginValidationMiddleware = validate(
  checkSchema({
    email: {
      notEmpty: { errorMessage: 'Email is required' },
      isEmail: { errorMessage: 'Invalid email' },
      normalizeEmail: true,
      trim: true
    },
    password: passwordSchema
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
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
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
            ;(req as Request).decode_authorization = decode_authorization as TokenPayload
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
              verifyToken({ token: value, privateKey: process.env.JWT_REFRESH_TOKEN_SECRET as string }),
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
export const verifyForgotPasswordTokenValidator = validate(
  checkSchema({
    forgot_password_token: forgotPasswordTokenSchema
  })
)
export const resetPasswordValidator = validate(
  checkSchema({
    forgot_password_token: forgotPasswordTokenSchema,
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  })
)
export const changePasswordValidator = validate(
  checkSchema({
    old_password: {
      notEmpty: { errorMessage: 'Old password is required' },
      trim: true
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  })
)
export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decode_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    next(new ErrorWithStatus({ message: 'User email is not verified', status: 403 }))
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema({
    name: {
      optional: true,
      notEmpty: { errorMessage: 'Name cannot be empty' },
      trim: true
    },
    date_of_birth: {
      optional: true,
      isISO8601: { errorMessage: 'Date of birth must be a valid date' },
      toDate: true
    },
    username: {
      optional: true,
      notEmpty: { errorMessage: 'Username cannot be empty' },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const { user_id } = req.decode_authorization as TokenPayload
          //Check regex username: only allow letters, numbers, underscores, dots, 4-15 characters, not only numbers
          const usernameRegex = /^(?![0-9]+$)(?!.*[_.]{2})[a-zA-Z0-9._]{4,15}$/
          if (!usernameRegex.test(value)) {
            throw new ErrorWithStatus({
              message:
                'Username must be 4-15 characters long, can contain letters, numbers, underscores, dots, and cannot be only numbers',
              status: 400
            })
          }
          const existingUser = await databasesService.users.findOne({ username: value })
          if (existingUser && existingUser._id.toString() !== user_id) {
            throw new ErrorWithStatus({ message: 'Username is already taken', status: 409 })
          }
          return true
        }
      }
    },
    avatar: {
      optional: true,
      isURL: { errorMessage: 'Avatar must be a valid URL' },
      trim: true
    },
    cover_photo: {
      optional: true,
      isURL: { errorMessage: 'Cover photo must be a valid URL' },
      trim: true
    },
    bio: {
      optional: true,
      isLength: {
        options: { max: 160 },
        errorMessage: 'Bio cannot exceed 160 characters'
      },
      trim: true
    },
    location: {
      optional: true,
      isLength: {
        options: { max: 30 },
        errorMessage: 'Location cannot exceed 30 characters'
      },
      trim: true
    },
    website: {
      optional: true,
      isURL: { errorMessage: 'Website must be a valid URL' },
      trim: true
    }
  })
)
export const followValidator = validate(
  checkSchema({
    followed_user_id: {
      notEmpty: { errorMessage: 'Followed user ID is required' },
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          const followedUser = await usersService.getUserById(value)
          if (!followedUser) {
            throw new ErrorWithStatus({ message: 'Followed user not found', status: 404 })
          }
          if (followedUser.verify !== UserVerifyStatus.Verified) {
            throw new ErrorWithStatus({ message: 'Cannot follow unverified user', status: 403 })
          }
          const isExistingFollow = await databasesService.followers.findOne({
            user_id: new ObjectId((req.decode_authorization as TokenPayload).user_id),
            followerId: new ObjectId(value)
          })
          if (isExistingFollow) {
            throw new ErrorWithStatus({ message: 'You are already following this user', status: 409 })
          }
          return true
        }
      }
    }
  })
)
export { loginValidationMiddleware }
