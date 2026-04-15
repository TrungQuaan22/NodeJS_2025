import { ObjectId } from "mongodb"

interface BookmarkType {
  _id?: string
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}
export default class Bookmark {
  _id: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at: Date
  constructor(data: BookmarkType) {
    this._id = data._id ? new ObjectId(data._id) : new ObjectId()
    this.user_id = data.user_id
    this.tweet_id = data.tweet_id
    this.created_at = data.created_at || new Date()
  }
}