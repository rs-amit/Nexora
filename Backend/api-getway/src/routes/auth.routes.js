import express from "express"
import { services } from "../config/services.js"
import { forwardRequest } from "../gateway/forwardRequest.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { authenticate } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post(
  "/signup",
  asyncHandler(async (req, res) => {

    const response = await forwardRequest(req, services.authService)

    Object.entries(response.headers || {}).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    res.status(response.status).send(response.data)

  })
)

router.post(
  "/login",
  asyncHandler(async (req, res) => {

    console.log("reached---------->")

    const response = await forwardRequest(req, services.authService)

    Object.entries(response.headers || {}).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    res.status(response.status).send(response.data)

  })
)


router.post(
  "/validate-users",
  authenticate,
  asyncHandler(async (req, res) => {

    const response = await forwardRequest(req, services.authService)

    Object.entries(response.headers || {}).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    res.status(response.status).send(response.data)

  })
)

export default router