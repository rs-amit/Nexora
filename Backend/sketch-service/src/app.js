import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

import sketchRoutes from "./routes/sketch.route.js"
import { errorHandler } from "./middlewares/errorhandler.middleware.js"

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.use(helmet())
app.use(morgan("dev"))

app.use(express.json())

app.use("/sketch", sketchRoutes)

app.use(errorHandler)

export default app
