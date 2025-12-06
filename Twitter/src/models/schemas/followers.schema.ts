import { ObjectId } from 'mongodb'

export interface FollowerType {
  _id?: ObjectId
  user_id?: ObjectId
  followerId?: ObjectId
  created_at?: Date
}

export class Follower {
  _id?: ObjectId
  user_id?: ObjectId
  followerId?: ObjectId
  created_at?: Date
  constructor({ _id, user_id, followerId, created_at }: FollowerType) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.followerId = followerId
    this.created_at = created_at || new Date()
  }
}
