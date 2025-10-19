import { Router } from 'express'
import { registerController } from '~/controllers/users.controllers'
import { loginController } from '~/controllers/users.controllers'
import { loginValidationMiddleware, registerValidator } from '~/middlewares/users.middlewares'

const userRouter = Router()

userRouter.post('/login', loginValidationMiddleware, loginController)
userRouter.post('/register', registerValidator, registerController)

export default userRouter
