import { ObjectId } from 'mongodb'
import { faker } from '@faker-js/faker'
import { TweetAudience, TweetType } from '~/constants/enums'
import databasesService from '~/services/databases.services'
import { User } from '~/models/schemas/users.schema'
import { hashPassword } from './hashPass'
import tweetService from '~/services/tweets.services'
const PASSWORD = 'TrungQuan21@'
const MYID = new ObjectId('69afdb62be515fbf87f33aee')
const USER_COUNT = 100

const createRandomUser = () => {
  const user = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD
  }
  return user
}

const createRandomTweet = () => {
  return {
    type: TweetType.TWEET,
    audience: TweetAudience.EVERYONE,
    content: faker.lorem.paragraph({ min: 1, max: 10 }),
    hashtags: [],
    mentions: [],
    medias: []
  }
}

const users = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
})
const insertUsers = async () => {
  const result = await Promise.all(users.map(async (user) => {
    const user_id = new ObjectId()
    const hashPass = await hashPassword(user.password)
    await databasesService.users.insertOne(new User({
      _id: user_id,
      ...user,
      password: hashPass,
      verify: 1
    }))
    return user_id
    }
  ))
  console.log(`Insert ${result.length} users successfully!`)
  return result
}

const insertFollowRelations = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
    const result = await Promise.all(followed_user_ids.map(async (followed_user_id) => {
      await databasesService.followers.insertOne({
        _id: new ObjectId(),
        user_id: followed_user_id,
        followerId: user_id
      })
    }))
    console.log(`Insert ${result.length} follow relations for user ${user_id} successfully!`)
}

const insertMultipleTweets = async (user_ids: ObjectId[]) => {
  console.log('Start insert tweets for users...')
  await Promise.all(user_ids.map(async (user_id) => {
    await Promise.all([
      tweetService.createTweet(user_id.toString(), createRandomTweet()),
      tweetService.createTweet(user_id.toString(), createRandomTweet()),
    ])
  }))
}

insertUsers().then((user_ids) => {
  insertFollowRelations(MYID, user_ids)
  insertMultipleTweets(user_ids)
})