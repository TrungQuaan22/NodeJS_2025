import { Router } from 'express'
import { logoutController, refreshTokenController, registerController, resendverifyEmailController, verifyEmailController } from '~/controllers/users.controllers'
import { loginController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidationMiddleware,
  refreshTokenValidator,
  registerValidator,
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

export default userRouter
