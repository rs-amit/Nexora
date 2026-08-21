import express from "express";
import { services } from "../config/services.js";
import { forwardRequest } from "../gateway/forwardRequest.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.get(
  "/my",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.get(
  "/:workspaceId",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.post(
  "/:workspaceId/rooms",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.get(
  "/:workspaceId/rooms",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.get(
  "/rooms/:roomId",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.get(
  "/rooms/:roomId/members",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.post(
  "/rooms/:roomId/members",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.delete(
  "/rooms/:roomId/members/:userId",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.post(
  "/:workspaceId/members",
  authenticate,
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.patch(
  "/:workspaceId",
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

router.delete(
  "/:workspaceId",
  asyncHandler(async (req, res) => {
    const response = await forwardRequest(
      req,
      services.workspaceService
    );

    Object.entries(response.headers || {}).forEach(
      ([key, value]) => {
        res.setHeader(key, value);
      }
    );

    res.status(response.status).send(response.data);
  })
);

export default router;