import { Router } from "express"
import { getNewFeedsController } from "~/controllers/tweets.controllers"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares"
import { wrapAsync } from "~/utils/wrapAsync"

const feedRouter = Router()

feedRouter.get("/", accessTokenValidator, verifiedUserValidator, wrapAsync(getNewFeedsController))

export default feedRouter