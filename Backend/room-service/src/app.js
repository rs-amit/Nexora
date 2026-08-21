import express from "express"
import helmet from "helmet"
import morgan from "morgan"

import roomRoutes from "./routes/room.route.js"

const app = express()

app.use(helmet())
app.use(morgan("dev"))

app.use(express.json())

app.use("/rooms", roomRoutes)

export default app