// Dùng để mở rộng kiểu Request của express
import { TokenPayload } from './models/request/user.req'
declare module 'express' {
  interface Request {
    user_id?: string // Thêm thuộc tính userId kiểu string, có thể undefined
    decode_authorization?: TokenPayload // access token payload
    refresh_token_payload?: TokenPayload // refresh token payload
    verify_token_payload?: TokenPayload // verify token payload
    forgot_password_token_payload?: TokenPayload // forgot password token payload
    tweet?: unknown // Thêm thuộc tính tweet để lưu thông tin tweet đã được xác thực
  }
}
