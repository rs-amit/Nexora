import express from "express"
import { createRoom } from "../controllers/room.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/", verifyToken, createRoom)

export default router