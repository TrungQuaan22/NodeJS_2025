import { checkSchema } from 'express-validator'
import { ErrorWithStatus } from '~/models/Errors'
import usersService from '~/services/users.services'
import validate from '~/utils/validate'

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

export { loginValidationMiddleware }
