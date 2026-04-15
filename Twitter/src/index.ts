import express from 'express'
import userRouter from './routes/users.routes'
import databasesService from './services/databases.services'
import defaultErrorHandler from './middlewares/errors.middleware'
import mediasRouter from './routes/medias.routes'
import { config } from 'dotenv'
import staticRouter from './routes/static.routes'
import tweetRouter from './routes/tweet.routes'
import feedRouter from './routes/feeds.routes'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
// import '~/utils/faker'
config()
const app = express()
const PORT = process.env.PORT || 4000
// Middleware để parse JSON
// Kết nối đến cơ sở dữ liệu trước khi khởi động server
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)
databasesService.run().catch(console.dir)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use('/uploads',express.static(UPLOAD_IMAGE_DIR))
// Sử dụng userRouter cho các route bắt đầu bằng /users
app.use('/users', userRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/tweets', tweetRouter)
app.use('/feeds', feedRouter)
app.use('/uploads', express.static('uploads'))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
