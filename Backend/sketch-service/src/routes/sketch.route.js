import express from "express"
import { getShapes } from "../controllers/sketch.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.get("/rooms/:roomId/shapes", verifyToken, getShapes)

export default router
