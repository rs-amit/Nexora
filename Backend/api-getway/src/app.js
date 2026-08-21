import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

import authRoutes from "./routes/auth.routes.js"
import roomRoutes from "./routes/room.routes.js"
import workspaceRoutes from "./routes/workspace.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import sketchRoutes from "./routes/sketch.routes.js"

import { errorHandler } from "./middlewares/errorhandler.middleware.js"

const app = express()

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
)

app.use(helmet())
app.use(morgan("dev"))

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/rooms", roomRoutes)
app.use("/api/workspace", workspaceRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/sketch", sketchRoutes)


app.use(errorHandler)

export default app