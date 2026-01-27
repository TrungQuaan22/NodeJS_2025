import { Request, Response } from 'express'
import fs from 'fs'
import mime from 'mime'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
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
export const getVideoController = async (req: Request, res: Response) => {
  const range = req.headers.range
  if (!range) {
    return res.status(400).send('Requires Range header')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  //dung lượng video
  const videoSize = fs.statSync(videoPath).size
  const CHUNK_SIZE = 10 ** 6 //1MB
  //Lấy ra start và end
  const start = Number(range.replace(/\D/g, ''))
  //Đoạn cuối của end nó sẽ lớn hơn videoSize nên phải dùng hàm Math.min
  // videoSize -1 vì đánh dấu từ 0
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
  //Dung lượng thực tế cho mỗi đoạn video stream
  //Vẫn là vì content length có thể = videoSize hoặc nhỏ hơn do đoạn cuối
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/mp4'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Content-Length': contentLength,
    'Content-Type': contentType,
    AcceptRanges: 'bytes'
  }
  res.writeHead(206, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)

}
export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediasServices.handleUploadVideo(req)
  return res.status(200).json({
    result
  })
}
