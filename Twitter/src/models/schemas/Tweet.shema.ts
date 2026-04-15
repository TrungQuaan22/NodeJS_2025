import { ObjectId } from "mongodb"
import { TweetAudience } from "~/constants/enums"
import { TweetType as TweetTypeEnum } from "~/constants/enums"
import { Media } from "../Other"

interface TweetType {
  _id? : ObjectId
  user_id: ObjectId
  type: TweetTypeEnum
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc
  root_tweet_id: ObjectId // id của tweet gốc, bằng _id nếu là tweet gốc
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  like_count?: number
  bookmark_count?: number
  retweet_count?: number
  reply_count?: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id : ObjectId
  user_id: ObjectId
  type: TweetTypeEnum
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc
  root_tweet_id: ObjectId // id của tweet gốc, bằng _id nếu là tweet gốc
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  like_count: number
  bookmark_count: number
  retweet_count: number
  reply_count: number
  created_at: Date
  updated_at: Date
  constructor(data: TweetType) {
    const date = new Date()
    this._id = data._id || new ObjectId()
    this.user_id = data.user_id
    this.type = data.type
    this.audience = data.audience
    this.content = data.content
    this.parent_id = data.parent_id ? new ObjectId(data.parent_id) : null
    this.root_tweet_id = data.root_tweet_id
    this.hashtags = data.hashtags
    this.mentions = data.mentions
    this.medias = data.medias
    this.guest_views = data.guest_views || 0
    this.user_views = data.user_views || 0
    this.like_count = data.like_count || 0
    this.bookmark_count = data.bookmark_count || 0
    this.retweet_count = data.retweet_count || 0
    this.reply_count = data.reply_count || 0
    this.created_at = date
    this.updated_at = date
  }
}