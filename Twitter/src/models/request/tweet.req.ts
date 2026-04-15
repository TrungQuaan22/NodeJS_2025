import { TweetAudience, TweetType as TweetTypeEnum } from "~/constants/enums"
import { Media } from "../Other"

export interface TweetRequestBody {
  type: TweetTypeEnum
  audience: TweetAudience
  content: string
  parent_id?: null | string //  chỉ null khi tweet gốc
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

export interface BookmarkRequestBody {
  tweet_id: string
}
export interface LikeRequestBody {
  tweet_id: string
}