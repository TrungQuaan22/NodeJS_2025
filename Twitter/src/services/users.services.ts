import { User, UserVerifyStatus } from '~/models/schemas/users.schema'
import databasesService from './databases.services'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/request/user.req'
import { comparePassword, hashPassword } from '~/utils/hashPass'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import { RefreshToken } from '~/models/schemas/refreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { Follower } from '~/models/schemas/followers.schema'
config()

class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    // Logic to sign access token
    return signToken({
      payload: { user_id, token_type: TokenType.ACCESS_TOKEN, verify },
      privateKey: process.env.JWT_ACCESS_TOKEN_SECRET as string,
      options: { expiresIn: '15m' }
    })
  }
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    // Logic to sign refresh token
    return signToken({
      payload: { user_id, token_type: TokenType.REFRESH_TOKEN, verify },
      privateKey: process.env.JWT_REFRESH_TOKEN_SECRET as string,
      options: { expiresIn: '7d' }
    })
  }
  private async signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.VERIFY_EMAIL_TOKEN, verify },
      privateKey: process.env.JWT_VERIFY_EMAIL_TOKEN_SECRET as string,
      options: { expiresIn: '1d' }
    })
  }
  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }
  private async signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.FORGOT_PASSWORD_TOKEN, verify },
      privateKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_SECRET as string,
      options: { expiresIn: '1h' }
    })
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const hashPass = await hashPassword(payload.password)
    await databasesService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        password: hashPass,
        date_of_birth: new Date(payload.date_of_birth),
        email_verify_token
      })
    )
    console.log('verify-token: ', email_verify_token)

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databasesService.refreshTokens.insertOne(new RefreshToken({ token: refresh_token, user_id }))
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
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user._id.toString(),
      verify: user.verify
    })
    databasesService.refreshTokens.insertOne(new RefreshToken({ token: refresh_token, user_id: user._id }))
    return { access_token, refresh_token }
  }
  async logout(refreshToken: string) {
    const result = await databasesService.refreshTokens.deleteOne({ token: refreshToken })
    return result
  }

  /*
   * Truyền vào refresh token cũ và user_id lấy trong req (truyền vào để tránh việc tìm user trong db lại)
   * Xóa refresh token cũ trong database
   * Tạo access token mới và refresh token mới
   */
  async refreshToken({
    oldRefreshToken,
    user_id,
    verify
  }: {
    oldRefreshToken: string
    user_id: string
    verify: UserVerifyStatus
  }) {
    const [access_token, new_refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
    // Delete old refresh token and insert new refresh token
    await databasesService.refreshTokens.deleteOne({ token: oldRefreshToken })

    // Insert new refresh token
    await databasesService.refreshTokens.insertOne(
      new RefreshToken({ token: new_refresh_token, user_id: new ObjectId(user_id) })
    )
    return { access_token, refresh_token: new_refresh_token }
  }
  /*
   * Verify email by token and user_id
   *
   */
  async verifyEmail(user_id: string) {
    const user = await databasesService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new ErrorWithStatus({ message: 'User not found', status: 404 })
    }
    if (user.email_verify_token === '') {
      throw new ErrorWithStatus({ message: 'Email already verified', status: 400 })
    }
    await databasesService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token: '', verify: 1 }, $currentDate: { updated_at: true } }
    )
    // Xóa refresh token cũ của user (nếu có)
    await databasesService.refreshTokens.deleteMany({ user_id: new ObjectId(user_id) })
    // Tạo access token và refresh token mới
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })
    // Lưu refresh token mới vào database
    await databasesService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    )
    return { access_token, refresh_token }
  }

  async resendverifyEmail(user_id: string) {
    const user = await databasesService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new ErrorWithStatus({ message: 'User not found', status: 404 })
    }
    if (user.verify === 1) {
      throw new ErrorWithStatus({ message: 'Email already verified', status: 400 })
    }
    // Giả bộ tạo lại token verify email và gửi email
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    console.log('Resend verify-token: ', email_verify_token)
    await databasesService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: { email_verify_token },
        $currentDate: { updated_at: true }
      }
    )
    return { message: 'Verification email resent successfully' }
  }

  async forgotPassword(user_id: string) {
    // Logic for forgot password
    // Chỉ tài khoản đã verify email mới được phép reset password
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })
    console.log('Forgot password token: ', forgot_password_token)
    // Here, you would typically send the token via email to the user
    await databasesService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { forgot_password_token }, $currentDate: { updated_at: true } }
    )
    return { message: 'Forgot password email sent successfully' }
  }
  async changePassword(user_id: string, old_password: string, new_password: string) {
    const user = await databasesService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new ErrorWithStatus({ message: 'User not found', status: 404 })
    }
    const isMatch = await comparePassword(old_password, user.password)
    if (!isMatch) {
      throw new ErrorWithStatus({
        message: 'Old password is incorrect',
        status: 401
      })
    }
    const hashPass = await hashPassword(new_password)
    await databasesService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashPass }, $currentDate: { updated_at: true } }
    )
    return { message: 'Password changed successfully' }
  }
  async checkEmailExists(email: string) {
    const result = await databasesService.users.findOne({ email })
    return Boolean(result)
  }
  async resetPassword(user_id: string, new_password: string) {
    const hashPass = await hashPassword(new_password)
    await databasesService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashPass, forgot_password_token: '' }, $currentDate: { updated_at: true } }
    )
    return { message: 'Password reset successfully' }
  }
  async getUserById(user_id: string) {
    const user = await databasesService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({ message: 'User not found', status: 404 })
    }
    return user
  }
  async updateUserById(user_id: string, updateData: UpdateMeReqBody) {
    const updateFields: Partial<User> = {}
    if (updateData.name !== undefined) updateFields.name = updateData.name
    if (updateData.bio !== undefined) updateFields.bio = updateData.bio
    if (updateData.location !== undefined) updateFields.location = updateData.location
    if (updateData.website !== undefined) updateFields.website = updateData.website
    const result = await databasesService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      { $set: updateFields, $currentDate: { updated_at: true } },
      { returnDocument: 'after', projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
    )
    return result
  }

  //get Profile
  async getProfileByUsername(username: string) {
    const user = await databasesService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          email: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({ message: 'User not found', status: 404 })
    }
    return user
  }
  // Tính năng Follow user
  async follow(user_id: string, followed_user_id: string) {
    databasesService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(followed_user_id),
        followerId: new ObjectId(user_id)
      })
    )
    return await this.getUserById(user_id)
  }
  async unfollow(user_id: string, followed_user_id: string) {
    const result = await databasesService.followers.deleteOne({
      user_id: new ObjectId(followed_user_id),
      followerId: new ObjectId(user_id)
    })
    if (result.deletedCount === 0) {
      throw new ErrorWithStatus({ message: 'You are not following this user', status: 400 })
    }
    return result
  }
}

const usersService = new UsersService()
export default usersService
