import { TweetAudience, TweetType } from "~/constants/enums"
import { Media } from "../Other"

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc
  hashtags: string[]
  mentions: string[]
  medias: Media[]
  guest_views: number
  user_views: number
}