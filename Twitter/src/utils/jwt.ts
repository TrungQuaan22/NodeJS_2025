import { config } from 'dotenv'
import { PrivateKey, Secret, sign, SignOptions } from 'jsonwebtoken'
config()

const JWT_SECRET = process.env.JWT_SECRET
export const signToken = ({
  payload,
  privateKey = JWT_SECRET,
  options
}: {
  payload: object
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
