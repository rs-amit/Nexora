import dotenv from "dotenv"
dotenv.config()

import app from "./app.js"
import connectDB  from "./db/db.js"

connectDB()

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`)
})