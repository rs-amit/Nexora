import express from "express"
import { getMessages } from "../controllers/chat.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.get("/rooms/:roomId/messages", verifyToken, getMessages)

export default router
