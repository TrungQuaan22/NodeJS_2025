import { JwtPayload } from "jsonwebtoken"
import { UserVerifyStatus } from "../schemas/users.schema"

export type RegisterReqBody = {
  name: string
  email: string
  password: string
  confirmPassword: string
  date_of_birth: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  verify: UserVerifyStatus
  token_type: string | number
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  username?: string
  avatar?: string
  cover_photo?: string
  bio?: string
  location?: string
  website?: string
}