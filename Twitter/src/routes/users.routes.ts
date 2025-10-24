import { Router } from 'express'
import { logoutController, registerController } from '~/controllers/users.controllers'
import { loginController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidationMiddleware,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/wrapAsync'

const userRouter = Router()

userRouter.post('/login', loginValidationMiddleware, wrapAsync(loginController))
userRouter.post('/register', registerValidator, wrapAsync(registerController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

export default userRouter
