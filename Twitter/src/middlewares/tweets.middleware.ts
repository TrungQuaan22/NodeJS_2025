/* eslint-disable @typescript-eslint/no-explicit-any */
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enums'
import databasesService from '~/services/databases.services'
import validate from '~/utils/validate'

export const createTweetVaidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [Object.values(TweetType)],
        errorMessage: 'Invalid tweet type'
      }
    },
    audience: {
      isIn: {
        options: [Object.values(TweetAudience)],
        errorMessage: 'Invalid tweet audience'
      }
    },
    parent_id: {
      custom: {
        options: async (value, { req }) => {
          const type = req.body.type
          if ([TweetType.COMMENT, TweetType.QUOTE_TWEET, TweetType.RETWEET].includes(type) && !value) {
            throw new Error('Parent ID is required for comment, quote, and retweet')
          }
          if (type === TweetType.TWEET && value) {
            throw new Error('Parent ID must be null for original tweet')
          }
          await checkTweetIdExistence(value)
          return true
        }
      }
    },
    content: {
      isString: {
        errorMessage: 'Content must be a string'
      },
      custom: {
        options: (value, { req }) => {
          const type = req.body.type
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          if (
            [TweetType.TWEET, TweetType.QUOTE_TWEET, TweetType.COMMENT].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            isEmpty(value)
          ) {
            throw new Error('Content must not be empty')
          }
          if ([TweetType.RETWEET].includes(type) && !isEmpty(value)) {
            throw new Error('Content must be empty for retweet')
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: {
        errorMessage: 'Hashtags must be an array'
      },
      custom: {
        options: (value) => {
          if (!value.every((tag: any) => typeof tag === 'string')) {
            throw new Error('Hashtags must be an array of strings')
          }
          return true
        }
      }
    },
    mentions: {
      isArray: {
        errorMessage: 'Mentions must be an array'
      },
      custom: {
        options: (value) => {
          if (!value.every((mention: any) => ObjectId.isValid(mention))) {
            throw new Error('Mentions must be an array of valid ObjectIds')
          }
          return true
        }
      }
    },
    medias: {
      isArray: {
        errorMessage: 'Medias must be an array'
      },
      custom: {
        options: (value) => {
          if (
            !value.every((media: any) => typeof media.url === 'string' && Object.values(MediaType).includes(media.type))
          ) {
            throw new Error('Each media must have a valid url and type')
          }
          return true
        }
      }
    }
  })
)
export const tweetIdValidator = validate(
  checkSchema({
    tweet_id: {
      isMongoId: {
        errorMessage: 'Invalid tweet ID'
      },
      custom: {
        options: async (value, { req }) => {
          req.tweet = await checkTweetIdExistence(value)
        }
      }
    }
  }, ['params', 'body'])
)

const checkTweetIdExistence = async (tweet_id: string) => {
  const tweet = await databasesService.tweets.findOne({ _id: new ObjectId(tweet_id) })
          if (!tweet) {
            throw new Error('Tweet does not exist')
          }
          return tweet
}