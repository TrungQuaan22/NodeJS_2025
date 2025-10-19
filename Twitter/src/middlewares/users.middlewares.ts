import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import usersService from '~/services/users.services'
import validate from '~/utils/validate'

const loginValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Username and password are required.' })
  }
  next()
}

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
            throw new Error('Email already in use')
          }
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
        }
      }
    }
  })
)

export { loginValidationMiddleware }
