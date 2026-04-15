import { Request, Response } from 'express';
import { TokenPayload } from '~/models/request/user.req';
import tweetService from '~/services/tweets.services';
export const bookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const { tweet_id } = req.body;
  const result = await tweetService.bookmarkTweet(user_id, tweet_id);
  return res.status(200).json({
    message: 'Tweet bookmarked successfully',
    result
  });
}
export const removeBookmarkController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload;
  const { tweet_id } = req.params;
  const result = await tweetService.removeBookmark(user_id, tweet_id);
  return res.status(200).json({
    message: 'Bookmark removed successfully',
    result
  });
}