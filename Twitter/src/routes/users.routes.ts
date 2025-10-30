import { Router } from 'express'
import {
  forgotPasswordController,
  getMeController,
  logoutController,
  refreshTokenController,
  registerController,
  resendverifyEmailController,
  resetPasswordController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { loginController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  forgotPasswordVaildator,
  loginValidationMiddleware,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  verifyTokenValidator
} from '~/middlewares/users.middlewares'
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
userRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))
export default userRouter
