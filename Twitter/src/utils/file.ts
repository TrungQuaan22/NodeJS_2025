import formidable from 'formidable'
import path from 'path'
import { Request } from 'express'

export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    keepExtensions: true,
    maxFields: 1,
    maxFileSize: 30000 * 1024,
    filter: (part) => {
      const isValid = part.name === 'image' && part.mimetype && part.mimetype.startsWith('image/')

      if (!isValid) {
        form.emit('error', new Error('Invalid'))
      }

      return Boolean(isValid)
    }
  })

  return new Promise((resolve, reject) => {
    form.on('error', (err) => {
      return reject(err)
    })
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      resolve({ fields, files })
    })
  })
}
