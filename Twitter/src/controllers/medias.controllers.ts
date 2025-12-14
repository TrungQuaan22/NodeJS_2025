import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { mediasServices } from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasServices.handleUploadImages(req)
  return res.status(200).json({
    result
  })
}
export const getImageController = async (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name))
}
export const uploadVideoontroller = async (req: Request, res: Response) => {
  const result = await mediasServices.handleUploadVideo(req)
  return res.status(200).json({
    result
  })
}
