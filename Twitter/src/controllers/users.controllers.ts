import { Request, Response } from 'express'
import { TokenPayload } from '~/models/request/user.req'
import usersService from '~/services/users.services'
const loginController = async (req: Request, res: Response) => {
  const result = await usersService.login(req.body)
  return res.json({ message: 'Login successful!', result })
}

export const registerController = async (req: Request, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({ message: 'Register successful!', result })
}

export const logoutController = async (req: Request, res: Response) => {
  // Invalidate the refresh token
  const refreshToken = req.body.refresh_token
  const result = await usersService.logout(refreshToken)
  return res.json({ message: 'Logout successful!', result })
}

export const refreshTokenController = async (req: Request, res: Response) => {
  const oldRefreshToken = req.body.refresh_token
  const user = req.decode_authorization as TokenPayload
  const user_id = user.user_id
  const result = await usersService.refreshToken({ oldRefreshToken, user_id, verify: user.verify })
  return res.json({ message: 'Token refreshed successfully!', result })
}
export const verifyEmailController = async (req: Request, res: Response) => {
  //Token verify ở middleware đã decode và lưu vào req.verify_token_payload
  const user_id = req.verify_token_payload?.user_id as string
  const result = await usersService.verifyEmail(user_id)
  return res.json({ message: 'Email verified successfully!', result })
}
export const resendverifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await usersService.resendverifyEmail(user_id)
  return res.json(result)
}
export const forgotPasswordController = async (req: Request, res: Response) => {
  const user_id = req.user_id as string
  const result = await usersService.forgotPassword(user_id)
  return res.json({ result })
}
export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({ message: 'Verify forgot password token success' })
}
export const resetPasswordController = async (req: Request, res: Response) => {
  const { password } = req.body
  console.log('password', password)
  const user_id = req.user_id as string
  console.log('user_id in controller', user_id)

  const result = await usersService.resetPassword(user_id, password)
  return res.json({ result })
}

export const changePasswordController = async (req: Request, res: Response) => {
  const user_id = req.decode_authorization?.user_id as string
  const { old_password, password } = req.body
  const result = await usersService.changePassword(user_id, old_password, password)
  return res.json({ message: 'Password changed successfully', result })
}
export const getMeController = async (req: Request, res: Response) => {
  const user_id = req.decode_authorization?.user_id as string
  const user = await usersService.getUserById(user_id)
  return res.json({ user })
}
export const updateMeController = async (req: Request, res: Response) => {
  const user_id = req.decode_authorization?.user_id as string
  const updateData = req.body
  const updatedUser = await usersService.updateUserById(user_id, updateData)
  return res.json({ message: 'User updated successfully', user: updatedUser })
}

export const getProfileController = async (req: Request, res: Response) => {
  const { username } = req.params
  const user = await usersService.getProfileByUsername(username)
  return res.json({ message: 'Profile fetched successfully', result: user })
}

export const followController = async (req: Request, res: Response) => {
  const user_id = req.decode_authorization?.user_id as string
  const { followed_user_id } = req.body
  const updatedUser = await usersService.follow(user_id, followed_user_id)
  return res.json({ message: 'User updated successfully', user: updatedUser })
}

export const unfollowController = async (req: Request, res: Response) => {
  const { followed_user_id } = req.params
  const user_id = req.decode_authorization?.user_id as string
  const result = await usersService.unfollow(user_id, followed_user_id)
  return res.json({ message: 'Unfollow successful', result })
}
export { loginController }
