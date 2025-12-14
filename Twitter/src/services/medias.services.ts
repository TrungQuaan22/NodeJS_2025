import { Request } from 'express'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enums'
import { getNameFileFromFullName, uploadImagesUtils, uploadVideoUtils } from '~/utils/file'

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
          url: `/static/image/${newName}.jpeg`,
          type: MediaType.IMAGE
        }
      })
    )
    return result
  }
  async handleUploadVideo(req: Request) {
    const files = await uploadVideoUtils(req)
    const video = files[0]
    const newName = getNameFileFromFullName(video.newFilename || '')
    const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpeg`)
    await sharp(video.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(video.filepath)
    return {
      url: `/static/video/${newName}`,
      type: MediaType.VIDEO
    }
  }
}

export const mediasServices = new MediasServices()
