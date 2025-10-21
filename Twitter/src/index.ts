import express from 'express'
import userRouter from './routes/users.routes'
import databasesService from './services/databases.services'
import defaultErrorHandler from './middlewares/errors.middleware'

const app = express()
const PORT = process.env.PORT || 4000
// Middleware để parse JSON
// Kết nối đến cơ sở dữ liệu trước khi khởi động server

databasesService.run().catch(console.dir)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Sử dụng userRouter cho các route bắt đầu bằng /users

app.use('/users', userRouter)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
