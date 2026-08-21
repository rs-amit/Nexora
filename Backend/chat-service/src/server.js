import dotenv from "dotenv"
dotenv.config()

import http from "http"
import app from "./app.js"
import connectDB from "./config/db.js"
import { initSocket } from "./socket/chatSocket.js"

const PORT = process.env.PORT || 5003

const start = async () => {

  await connectDB()

  const httpServer = http.createServer(app)

  initSocket(httpServer)

  httpServer.listen(PORT, () => {
    console.log(`Chat service running on ${PORT}`)
  })

}

start()
