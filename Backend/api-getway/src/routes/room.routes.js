import express from "express"
import { services } from "../config/services.js"
import { forwardRequest } from "../gateway/forwardRequest.js"
import { asyncHandler } from "../utils/asynchandler.js"

const router = express.Router()

/*
Create Room
*/
router.post(
  "/",
  asyncHandler(async (req, res) => {

    const response = await forwardRequest(req, services.roomService)

    console.log("forward-api")

    Object.entries(response.headers || {}).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    res.status(response.status).send(response.data)

  })
)

/*
Get Room
*/
router.get(
  "/:roomId",
  asyncHandler(async (req, res) => {

    const response = await forwardRequest(req, services.roomService)

    Object.entries(response.headers || {}).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    res.status(response.status).send(response.data)

  })
)

/*
Invite Users
*/
router.post(
  "/:roomId/invite",
  asyncHandler(async (req, res) => {

    const response = await forwardRequest(req, services.roomService)

    Object.entries(response.headers || {}).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    res.status(response.status).send(response.data)

  })
)

export default router