import formidable from 'formidable'
import { Request } from 'express'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import { nanoid } from 'nanoid'

export const initUploadDir = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

export const uploadImagesUtils = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    keepExtensions: true,
    maxFiles: 5,
    maxFileSize: 5000 * 1024,
    maxTotalFileSize: 25000 * 1024,
    filter: (part) => {
      const isValid = part.name === 'image' && part.mimetype && part.mimetype.startsWith('image/')
      return Boolean(isValid)
    }
  })

  return new Promise<formidable.File[]>((resolve, reject) => {
    initUploadDir()
    form.on('error', (err) => {
      return reject(err)
    })
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      resolve(files.image as formidable.File[])
    })
  })
}

export const uploadVideoUtils = async (req: Request) => {
  const idName = nanoid()
  const uploadVideoDir = path.resolve(UPLOAD_VIDEO_DIR, idName)
  fs.mkdirSync(uploadVideoDir, { recursive: true })
  const form = formidable({
    uploadDir: uploadVideoDir,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
    filter: () => {
      return true
    },
    filename: (name, ext) => {
      return `${idName}${ext}`
    }
  })

  return new Promise<formidable.File[]>((resolve, reject) => {
    initUploadDir()
    form.on('error', (err) => {
      return reject(err)
    })
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      resolve(files.video as formidable.File[])
    })
  })
}

export const getNameFileFromFullName = (fullFilename: string) => {
  const parts = fullFilename.split('.')
  parts.pop()
  return parts.join('')
}
