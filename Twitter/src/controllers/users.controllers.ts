import { Request, Response } from 'express'
import usersService from '~/services/users.services'
const loginController = async (req: Request, res: Response) => {
  const result = await usersService.login(req.body)
  return res.json({ message: 'Login successful!', result })
}

export const registerController = async (req: Request, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({ message: 'Register successful!', result })
}

export { loginController }
