import express from "express";
import { services } from "../config/services.js";
import { forwardRequest } from "../gateway/forwardRequest.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/rooms/:roomId/messages",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(req, services.chatService);

    Object.entries(response.headers || {}).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(response.status).send(response.data);
  })
);

export default router;
