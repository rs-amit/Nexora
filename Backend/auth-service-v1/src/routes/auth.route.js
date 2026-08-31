import express from "express"
import { signup, login, refreshToken, validateUsers, logout, findUserByEmail, searchUsers } from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.post("/refresh", refreshToken)
router.post("/validate-users", validateUsers)
router.post("/find-by-email", findUserByEmail)
router.get("/search-users", searchUsers)

export default router
