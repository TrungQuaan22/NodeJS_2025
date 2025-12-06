import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/wrapAsync'

const mediasRouter = Router()
// Define media-related routes here
mediasRouter.post('/upload-image', wrapAsync(uploadImageController))
export default mediasRouter
