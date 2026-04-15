import { ObjectId } from "mongodb"

interface LikeType {
  _id?: string
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}
export default class Like {
  _id: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at: Date
  constructor(data: LikeType) {
    this._id = data._id ? new ObjectId(data._id) : new ObjectId()
    this.user_id = data.user_id
    this.tweet_id = data.tweet_id
    this.created_at = data.created_at || new Date()
  }
}