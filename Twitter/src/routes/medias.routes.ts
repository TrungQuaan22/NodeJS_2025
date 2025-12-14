import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/wrapAsync'

const mediasRouter = Router()
// Define media-related routes here
mediasRouter.post('/upload-image',accessTokenValidator ,wrapAsync(uploadImageController))
mediasRouter.post('/upload-video',accessTokenValidator ,wrapAsync(uploadImageController))
export default mediasRouter
