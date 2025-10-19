import { Router } from 'express'
import { registerController } from '~/controllers/users.controllers'
import { loginController } from '~/controllers/users.controllers'
import { loginValidationMiddleware, registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/wrapAsync'

const userRouter = Router()

userRouter.post('/login', loginValidationMiddleware, loginController)
userRouter.post('/register', registerValidator, wrapAsync(registerController))

export default userRouter
