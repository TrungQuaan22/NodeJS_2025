import { config } from 'dotenv'
import { Request } from 'express'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enums'
import { getNameFileFromFullName, uploadImagesUtils, uploadVideoUtils } from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'

config()
class MediasServices {
  async handleUploadImages(req: Request) {
    const files = await uploadImagesUtils(req)
    const result = Promise.all(
      files.map(async (file) => {
        const newName = getNameFileFromFullName(file.newFilename || '')
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpeg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: `${process.env.VITE_BASE_URL}/static/image-self/${newName}.jpeg`,
          type: MediaType.IMAGE
        }
      })
    )
    return result
  }
  async handleUploadVideo(req: Request) {
    const files = await uploadVideoUtils(req)
    const video = files[0]
    return {
      url: `${process.env.VITE_BASE_URL}/static/video/${video.newFilename}`,
      type: MediaType.VIDEO
    }
  }

  async handleUploadVideoHLS(req: Request) {
    const files = await uploadVideoUtils(req)
    const video = files[0]
    await encodeHLSWithMultipleVideoStreams(video.filepath)
    const newName = getNameFileFromFullName(video.newFilename || '')
    fs.unlinkSync(video.filepath)
    return {
      url: `${process.env.VITE_BASE_URL}/static/video-hls/${newName}/master.m3u8`,
      type: MediaType.VIDEO
    }
  }
}

export const mediasServices = new MediasServices()
