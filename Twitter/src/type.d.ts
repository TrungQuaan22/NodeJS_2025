// Dùng để mở rộng kiểu Request của express
import { TokenPayload } from './models/request/authentication'
declare module 'express' {
  interface Request {
    userId?: string // Thêm thuộc tính userId kiểu string, có thể undefined
    decode_authorization?: TokenPayload
    refresh_token_payload?: TokenPayload
  }
}
