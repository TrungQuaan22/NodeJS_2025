import express, { NextFunction, Request, Response } from 'express'
import userRouter from './routes/users.routes'
import databasesService from './services/databases.services'

const app = express()
const PORT = process.env.PORT || 4000
// Middleware để parse JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error) {
    return res.status(400).json({ message: error.message })
  }
  next()
})
// Kết nối đến cơ sở dữ liệu trước khi khởi động server

databasesService.run().catch(console.dir)
// Sử dụng userRouter cho các route bắt đầu bằng /users

app.use('/users', userRouter)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
