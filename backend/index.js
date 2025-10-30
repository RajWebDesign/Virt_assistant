import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import connectDb from './config/db.js'
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import userRouter from './routes/user.routes.js'
import geminiResponse from './gemini.js'



const app = express()
app.use(cors({
  origin: "virt-assistant-43vms0k1k-rajnandinis-projects-9e0efaf8.vercel.app",
  credentials: true  
}));

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

const port = process.env.PORT || 8000

app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter )









app.listen(port, () => {
  connectDb()
  console.log("it's running")
})
