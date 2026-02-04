import { ObjectId } from "mongodb"
import { TweetAudience } from "~/constants/enums"
import { Media } from "../Other"

interface TweetType {
  _id : ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id : ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
  constructor(data: TweetType) {
    const date = new Date()
    this._id = data._id || new ObjectId()
    this.user_id = data.user_id
    this.type = data.type
    this.audience = data.audience
    this.content = data.content
    this.parent_id = data.parent_id
    this.hashtags = data.hashtags
    this.mentions = data.mentions
    this.medias = data.medias
    this.guest_views = data.guest_views || 0
    this.user_views = data.user_views || 0
    this.created_at = date
    this.updated_at = date
  }
}