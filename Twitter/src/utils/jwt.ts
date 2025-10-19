import { PrivateKey, Secret, sign, SignOptions } from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT

export const signToken = (
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret | PrivateKey,
  options?: SignOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    sign(payload, JWT_SECRET as Secret | PrivateKey, options || {}, (err, token) => {
      if (err || !token) return reject(err)
      resolve(token)
    })
  })
}
