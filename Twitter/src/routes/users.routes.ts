import { Router } from 'express'
import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  logoutController,
  refreshTokenController,
  registerController,
  resendverifyEmailController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { loginController } from '~/controllers/users.controllers'
import { filterBodyMiddleware } from '~/middlewares/common.middleware'
import {
  accessTokenValidator,
  changePasswordValidator,
  followValidator,
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
userRouter.put('/change-password', accessTokenValidator, changePasswordValidator, wrapAsync(changePasswordController))
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

userRouter.get('/profile/:username', wrapAsync(getProfileController))

//Tính năng Following
/**
 * Follow a user
 * Method: POST
 * URL: /users/follow
 * Body: { followed_user_id: string }
 * Headers: { Authorization: 'Bearer <access_token>' }
 */
userRouter.post('/follow', accessTokenValidator, verifiedUserValidator, followValidator, wrapAsync(followController))
userRouter.delete(
  '/follow/:followed_user_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapAsync(unfollowController)
)

export default userRouter
