// Dùng để mở rộng kiểu Request của express
import { TokenPayload } from './models/request/authentication'
declare module 'express' {
  interface Request {
    user_id?: string // Thêm thuộc tính userId kiểu string, có thể undefined
    decode_authorization?: TokenPayload // access token payload
    refresh_token_payload?: TokenPayload // refresh token payload
    verify_token_payload?: TokenPayload // verify token payload
  }
}
