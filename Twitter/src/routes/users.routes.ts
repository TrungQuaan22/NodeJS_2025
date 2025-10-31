import { Router } from 'express'
import {
  forgotPasswordController,
  getMeController,
  logoutController,
  refreshTokenController,
  registerController,
  resendverifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { loginController } from '~/controllers/users.controllers'
import { filterBodyMiddleware } from '~/middlewares/common.middleware'
import {
  accessTokenValidator,
  forgotPasswordVaildator,
  loginValidationMiddleware,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator,
  verifyTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/request/user.req'
import { wrapAsync } from '~/utils/wrapAsync'

const userRouter = Router()

userRouter.post('/login', loginValidationMiddleware, wrapAsync(loginController))
userRouter.post('/register', registerValidator, wrapAsync(registerController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))
userRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))
userRouter.post('/verify-email', verifyTokenValidator, wrapAsync(verifyEmailController))
userRouter.get('/resend-verify-email', accessTokenValidator, wrapAsync(resendverifyEmailController))
userRouter.post('/forgot-password', forgotPasswordVaildator, wrapAsync(forgotPasswordController))
userRouter.post(
  '/verify-forgot-password-token',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)
userRouter.post('/reset-password', resetPasswordValidator, wrapAsync(resetPasswordController))
userRouter.get('/me', accessTokenValidator, verifiedUserValidator, wrapAsync(getMeController))
userRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterBodyMiddleware<UpdateMeReqBody>([
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'name',
    'username',
    'website'
  ]),
  wrapAsync(updateMeController)
)
export default userRouter
