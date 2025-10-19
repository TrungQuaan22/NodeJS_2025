import { User } from '~/models/schemas/users.schema'
import databasesService from './databases.services'
import { RegisterReqBody } from '~/models/request/authentication'
import { hashPassword } from '~/utils/hashPass'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'

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
    return { access_token, refresh_token }
  }
  async checkEmailExists(email: string) {
    const result = await databasesService.users.findOne({ email })
    return Boolean(result)
  }
}

const usersService = new UsersService()
export default usersService
