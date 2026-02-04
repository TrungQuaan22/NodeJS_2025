import { Request, Response } from 'express'
export const createTweetController = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Create tweet controller' })
}
