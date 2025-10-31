import { config } from 'dotenv'
import { PrivateKey, PublicKey, Secret, sign, SignOptions, verify } from 'jsonwebtoken'
import { TokenPayload } from '~/models/request/user.req'
config()
export const signToken = ({
  payload,
  privateKey,
  options
}: {
  payload: TokenPayload
  privateKey: PrivateKey
  options?: SignOptions
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    sign(payload, privateKey as Secret | PrivateKey, options || { algorithm: 'HS256' }, (err, token) => {
      if (err || !token) return reject(err)
      resolve(token)
    })
  })
}

export const verifyToken = ({ token, privateKey }: { token: string; privateKey: PrivateKey }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    verify(token, privateKey as Secret | PublicKey, (err, decoded) => {
      if (err) reject(err)
      resolve(decoded as TokenPayload)
    })
  })
}
