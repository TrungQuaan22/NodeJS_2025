import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'
import { User } from '~/models/schemas/users.schema'
import { RefreshToken } from '~/models/schemas/refreshToken.schema'
import { Follower } from '~/models/schemas/followers.schema'
dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@twitter-dev.b5uscoc.mongodb.net/?retryWrites=true&w=majority&appName=twitter-dev`
class DatabasesService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(process.env.DB_NAME)
  }
  async run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect()
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      this.indexUsers()
      this.indexFollowers()
      this.indexRefreshTokens()
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (e) {
      console.error(e)
    } finally {
      // Ensures that the client will close when you finish/error
      // await this.client.close();
    }
  }
  indexUsers() {
    const existIndexes = this.users.indexExists(['email_1', 'username_1'])
    if (!existIndexes) {
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }
  indexRefreshTokens() {
    const existIndexes = this.refreshTokens.indexExists(['token_1'])
    if (!existIndexes) {
      this.refreshTokens.createIndex({ token: 1 }, { unique: true })
    }
  }
  indexFollowers() {
    const existIndexes = this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (!existIndexes) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 }, { unique: true })
    }
  }
  get users(): Collection<User> {
    return this.db.collection('users')
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('refresh_tokens')
  }
  get followers(): Collection<Follower> {
    return this.db.collection('followers')
  }
}
const databasesService = new DatabasesService()
export default databasesService
// databasesService.
