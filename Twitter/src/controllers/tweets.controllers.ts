import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { TweetType } from '~/constants/enums'
import { TokenPayload } from '~/models/request/user.req'
import tweetService from '~/services/tweets.services'
export const createTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const newTweet = await tweetService.createTweet(user_id, req.body)
  await tweetService.increaseReplyCount({
    parent_id: newTweet.parent_id?.toString(),
    root_tweet_id: newTweet.root_tweet_id.toString()
  })
  return res.status(200).json({
    message: 'Create tweet successfully',
    result: newTweet
  })
}

export const getTweetController = async (req: Request, res: Response) => {
  const tweet = req.tweet
  await tweetService.getTweetDetails((tweet as { _id: ObjectId })._id.toString())
  return res.status(200).json({
    message: 'get Tweet successfully',
    tweet
  })
}
//get Tweet children
/**
 *
 * @param req
 * query ?limit=10
 * @param res
 * @returns
 */
export const getTweetChildrenController = async (req: Request, res: Response) => {
  const tweet_id = req.params.tweet_id
  const { limit, cursor, tweet_type } = req.query
  const result = await tweetService.getTweetChildren({
    tweet_id,
    limit: Number(limit) || 5,
    tweet_type: tweet_type as TweetType,
    cursor: cursor as string | undefined
  })
  return res.status(200).json({
    message: 'get Tweet children successfully',
    result
  })
}

export const getNewFeedsController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, cursor } = req.query
  const result = await tweetService.getNewFeeds(user_id, Number(limit) || 10, cursor as string | undefined)
  return res.json({
    message: 'get new feeds successfully',
    result
  })
}
