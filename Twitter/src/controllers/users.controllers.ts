import { Request, Response } from 'express'
import usersService from '~/services/users.services'
const loginController = (req: Request, res: Response) => {
  res.json({ message: 'Login successful!' })
}

export const registerController = async (req: Request, res: Response) => {
  try {
    // Logic to register a user
    const result = await usersService.register(req.body)
    return res.json({ message: 'Register successful!', result })
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error })
  }

}

export { loginController }
