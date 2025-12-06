import { Request, Response } from 'express'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadImageController = async (req: Request, res: Response) => {
  const data = await handleUploadSingleImage(req)
  res.status(200).json({
    message: 'Image uploaded successfully',
    data
  })

}
