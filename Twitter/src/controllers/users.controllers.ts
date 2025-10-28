import { Request, Response } from 'express'
import { TokenPayload } from '~/models/request/authentication'
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
  const user_id = req.refresh_token_payload?.user_id as string
  const result = await usersService.refreshToken(oldRefreshToken, user_id)
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
export { loginController }
