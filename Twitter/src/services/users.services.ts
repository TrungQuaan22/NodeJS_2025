import { User } from '~/models/schemas/users.schema'
import databasesService from './databases.services'
import { RegisterReqBody } from '~/models/request/authentication'
import { comparePassword, hashPassword } from '~/utils/hashPass'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import { RefreshToken } from '~/models/schemas/refreshToken.schema'
import { ObjectId } from 'mongodb'

class UsersService {
  private signAccessToken(user_id: string) {
    // Logic to sign access token
    return signToken({ payload: { user_id, token_type: TokenType.ACCESS_TOKEN }, options: { expiresIn: '15m' } })
  }
  private signRefreshToken(user_id: string) {
    // Logic to sign refresh token
    return signToken({ payload: { user_id, token_type: TokenType.REFRESH_TOKEN }, options: { expiresIn: '7d' } })
  }
  async register(payload: RegisterReqBody) {
    const hashPass = await hashPassword(payload.password)
    const result = await databasesService.users.insertOne(
      new User({ ...payload, password: hashPass, date_of_birth: new Date(payload.date_of_birth) })
    )
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(result.insertedId.toString()),
      this.signRefreshToken(result.insertedId.toString())
    ])
    databasesService.refreshTokens.insertOne(new RefreshToken({ token: refresh_token, user_id: result.insertedId }))
    return { access_token, refresh_token }
  }
  async login({ email, password }: { email: string; password: string }) {
    const user = await databasesService.users.findOne({ email })
    if (!user) {
      throw new Error('User not found')
    }
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      throw new ErrorWithStatus({
        message: 'Invalid email or password',
        status: 401
      })
    }
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user._id.toString()),
      this.signRefreshToken(user._id.toString())
    ])
    databasesService.refreshTokens.insertOne(new RefreshToken({ token: refresh_token, user_id: user._id }))
    return { access_token, refresh_token }
  }
  async logout(refreshToken: string) {
    const result = await databasesService.refreshTokens.deleteOne({ token: refreshToken })
    return result
  }
  async refreshToken(oldRefreshToken: string, user_id: string) {
    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    // Delete old refresh token and insert new refresh token
    await databasesService.refreshTokens.deleteOne({ token: oldRefreshToken })

    // Insert new refresh token
    await databasesService.refreshTokens.insertOne(
      new RefreshToken({ token: new_refresh_token, user_id: new ObjectId(user_id) })
    )
    return { access_token, refresh_token: new_refresh_token }
  }
  async checkEmailExists(email: string) {
    const result = await databasesService.users.findOne({ email })
    return Boolean(result)
  }
}

const usersService = new UsersService()
export default usersService
