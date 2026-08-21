import dotenv from "dotenv"
dotenv.config()

import app from "./app.js"
import connectDB  from "./config/db.js"

const PORT = process.env.PORT || 5002

console.log("PORT", process.env.PORT)

const start = async () => {

  await connectDB()

  app.listen(PORT, () => {
    console.log(`Room service running on ${PORT}`)
  })

}

start()