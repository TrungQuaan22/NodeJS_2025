import { Router } from "express";
import { createTweetController } from "~/controllers/tweets.controllers";
import { createTweetVaidator } from "~/middlewares/tweets.middleware";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapAsync } from "~/utils/wrapAsync";

const tweetRouter = Router()

 tweetRouter.get("/", accessTokenValidator, verifiedUserValidator,createTweetVaidator, wrapAsync(createTweetController))

 export default tweetRouter