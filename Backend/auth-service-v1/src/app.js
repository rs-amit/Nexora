import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/auth.route.js"

const app = express()

app.use(helmet())
app.use(morgan("dev"))
app.use(cookieParser())
app.use(express.json())

app.use("/auth", authRoutes)

export default app
