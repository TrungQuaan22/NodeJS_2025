import { TweetRequestBody } from '~/models/request/tweet.req'
import databasesService from './databases.services'
import Tweet from '~/models/schemas/Tweet.shema'
import { ObjectId } from 'mongodb'
import { TweetType as TweetTypeEnum } from '~/constants/enums'
import Hashtag from '~/models/schemas/hashtags.schemas'
import Bookmark from '~/models/schemas/bookmarks.schema'
import Like from '~/models/schemas/likes.schema'

class TweetService {
  //Get all followed users
  async getFollowedUsers(user_id: string) {
    const followedUsers = await databasesService.followers
      .find({ followerId: new ObjectId(user_id) })
      .project({ _id: 0, user_id: 1 })
      .toArray()
    return followedUsers.map((doc) => doc.user_id)
  }
  async checkAndCreateHashtags(hashtags: string[]) {
    // Check hashtags existence and create if not exist, return array of ObjectId
    const hashtagsDocs = await Promise.all(
      hashtags.map((hashtag) => {
        return databasesService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagsDocs.map((doc) => doc.value?._id as ObjectId)
  }

  async createTweet(user_id: string, payload: TweetRequestBody) {
    const tweet_id = new ObjectId()
    let root_tweet_id = tweet_id
    // Logic to create a tweet
    if (payload.parent_id) {
      const parentTweet = await databasesService.tweets.findOne({ _id: new ObjectId(payload.parent_id) })
      if (!parentTweet) {
        throw new Error('Parent tweet not found')
      }
      root_tweet_id = parentTweet.root_tweet_id
    }
    const newTweet = new Tweet({
      _id: tweet_id,
      user_id: new ObjectId(user_id),
      audience: payload.audience,
      content: payload.content,
      hashtags: (await this.checkAndCreateHashtags(payload.hashtags)) || [],
      mentions: payload.mentions.map((id) => new ObjectId(id)),
      medias: payload.medias || [],
      type: payload.type as TweetTypeEnum,
      parent_id: payload.parent_id ? payload.parent_id : null,
      root_tweet_id
    })
    await databasesService.tweets.insertOne(newTweet)
    return newTweet
  }

  async increaseReplyCount({ parent_id, root_tweet_id }: { parent_id?: string; root_tweet_id: string }) {
    if (!parent_id) return
    const ids = [root_tweet_id]
    if (parent_id && parent_id !== root_tweet_id) {
      ids.push(parent_id)
    }
    await databasesService.tweets.updateMany(
      { _id: { $in: ids.map((id) => new ObjectId(id)) } },
      { $inc: { reply_count: 1 } }
    )
  }

  async bookmarkTweet(user_id: string, tweet_id: string) {
    const userid_obj = new ObjectId(user_id)
    const tweetid_obj = new ObjectId(tweet_id)
    // Logic to bookmark a tweet
    const result = await databasesService.bookmarks.findOneAndUpdate(
      { user_id: userid_obj, tweet_id: tweetid_obj },
      {
        $setOnInsert: new Bookmark({
          user_id: userid_obj,
          tweet_id: tweetid_obj
        })
      },
      { upsert: true, returnDocument: 'after' }
    )
    //increase bookmark count in tweet document
    await databasesService.tweets.updateOne({ _id: tweetid_obj }, { $inc: { bookmark_count: 1 } })
    return result
  }
  async removeBookmark(user_id: string, tweet_id: string) {
    // Logic to remove a bookmark
    const result = await databasesService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    //decrease bookmark count in tweet document
    await databasesService.tweets.updateOne({ _id: new ObjectId(tweet_id) }, { $inc: { bookmark_count: -1 } })
    return result
  }
  async likeTweet(user_id: string, tweet_id: string) {
    // Logic to like a tweet
    const result = await databasesService.likes.insertOne(
      new Like({
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      })
    )
    return result
  }
  async unlikeTweet(user_id: string, tweet_id: string) {
    // Logic to unlike a tweet
    const result = await databasesService.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }

  //get Tweet
  async getTweetDetails(tweet_id: string) {
    return await databasesService.tweets.updateOne({ _id: new ObjectId(tweet_id) }, { $inc: { user_views: 1 } })
  }

  //get Tweet children
  async getTweetChildren({
    tweet_id,
    limit,
    cursor,
    tweet_type
  }: {
    tweet_id: string
    limit: number
    cursor?: string
    tweet_type: TweetTypeEnum
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { parent_id: new ObjectId(tweet_id), type: tweet_type }
    if (cursor) {
      query._id = { $gt: new ObjectId(cursor) }
    }
    const children = await databasesService.tweets.find(query).sort({ _id: 1 }).limit(limit).toArray()
    const nextCursor = children.length > 0 ? children[children.length - 1]._id.toString() : null
    return { children, nextCursor }
  }

  //get new feeds
  async getNewFeeds(user_id: string, limit: number, cursor?: string) {
    const followedUsers = await this.getFollowedUsers(user_id)
    followedUsers.push(new ObjectId(user_id)) // Include user's own tweets in feed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchStage: any = {
          type: {
            $in: [TweetTypeEnum.TWEET, TweetTypeEnum.RETWEET]
          },
          user_id: {
            $in: followedUsers
          }
        }
    if (cursor) {
      matchStage._id = { $lt: new ObjectId(cursor) }
    }
    const tweets = await databasesService.tweets.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: 'users',
          let: {
            author_id: '$user_id'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$author_id']
                }
              }
            },
            {
              $project: {
                name: 1,
                username: 1,
                avatar: 1,
                verify_status: 1,
                twitter_circle: 1
              }
            }
          ],
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $match: {
          $or: [
            {
              audience: 'everyone'
            },
            {
              user_id: new ObjectId(user_id)
            },
            {
              'author.twitter_circle': new ObjectId(user_id)
            }
          ]
        }
      },
      {
        $sort: {
          _id: -1
        }
      },
      {
        $limit: limit + 1
      }
    ]).toArray()
    const hasNext = tweets.length > limit
    if (hasNext) {
      tweets.pop() // Remove the extra tweet used to check for next page
    }
    const nextCursor = hasNext ? tweets[tweets.length - 1]._id.toString() : null
    return {
      tweets,
      next_cursor: nextCursor,
      has_next: hasNext
    }


  }
}
const tweetService = new TweetService()
export default tweetService
