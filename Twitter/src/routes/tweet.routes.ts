import { Router } from "express";
import { bookmarkTweetController, removeBookmarkController } from "~/controllers/bookmarks.controllers";
import { likeTweetController, unlikeTweetController } from "~/controllers/likes.controllers";
import { createTweetController, getTweetChildrenController, getTweetController } from "~/controllers/tweets.controllers";
import { createTweetVaidator, tweetIdValidator } from "~/middlewares/tweets.middleware";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapAsync } from "~/utils/wrapAsync";

const tweetRouter = Router()

//Tweet routes
tweetRouter.post("/create", accessTokenValidator, verifiedUserValidator,createTweetVaidator, wrapAsync(createTweetController))
tweetRouter.get("/:tweet_id", tweetIdValidator, wrapAsync(getTweetController))
//Bookmark
tweetRouter.post("/bookmark", accessTokenValidator, verifiedUserValidator,tweetIdValidator , wrapAsync(bookmarkTweetController))
tweetRouter.delete("/:tweet_id/remove-bookmark", accessTokenValidator, verifiedUserValidator,tweetIdValidator, wrapAsync(removeBookmarkController))
//Like
tweetRouter.post("/like", accessTokenValidator, verifiedUserValidator, tweetIdValidator, wrapAsync(likeTweetController))
tweetRouter.delete("/:tweet_id/unlike", accessTokenValidator, verifiedUserValidator, tweetIdValidator, wrapAsync(unlikeTweetController))
//Get Tweet details
tweetRouter.get("/:tweet_id", tweetIdValidator, wrapAsync(getTweetController))
 export default tweetRouter

 //Get Tweet children
 //Query: {limit: number, page: number, tweet_type: TweetTypeEnum}
tweetRouter.get("/:tweet_id/children", tweetIdValidator, wrapAsync(getTweetChildrenController))

