import { config } from 'dotenv'
import { PrivateKey, PublicKey, Secret, sign, SignOptions, verify } from 'jsonwebtoken'
import { TokenPayload } from '~/models/request/authentication'
config()

const JWT_SECRET = process.env.JWT_SECRET
export const signToken = ({
  payload,
  privateKey = JWT_SECRET,
  options
}: {
  payload: TokenPayload
  privateKey?: PrivateKey
  options?: SignOptions
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    sign(payload, privateKey as Secret | PrivateKey, options || { algorithm: 'HS256' }, (err, token) => {
      if (err || !token) return reject(err)
      resolve(token)
    })
  })
}

export const verifyToken = ({ token, privateKey = JWT_SECRET }: { token: string; privateKey?: PrivateKey }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    verify(token, privateKey as Secret | PublicKey, (err, decoded) => {
      if (err) reject(err)
      resolve(decoded as TokenPayload)
    })
  })
}
