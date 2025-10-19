import express from 'express'
import userRouter from './models/routes/users.routes'
import databasesService from './services/databases.services'

const app = express()
const PORT = process.env.PORT || 4000
// Middleware để parse JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

databasesService.run().catch(console.dir);
// Sử dụng userRouter cho các route bắt đầu bằng /users

app.use('/users', userRouter)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
