import { Request, Response } from "express";
import { TokenPayload } from "~/models/request/user.req";
import tweetService from "~/services/tweets.services";
export const likeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const { tweet_id } = req.body;
  const result = await tweetService.likeTweet(user_id, tweet_id);
  return res.status(200).json({
    message: 'Tweet liked successfully',
    result
  });
}
export const unlikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const { tweet_id } = req.params;
  const result = await tweetService.unlikeTweet(user_id, tweet_id);
  return res.status(200).json({
    message: 'Tweet unliked successfully',
    result
  });
}