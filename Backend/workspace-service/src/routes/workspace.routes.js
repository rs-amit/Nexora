import express from "express";

import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  inviteMember,
} from "../controllers/workspace.controller.js";

// import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  createWorkspace
);

router.get(
  "/my",
  getMyWorkspaces
);

router.get(
  "/:workspaceId",
  getWorkspaceById
);

router.post(
  "/:workspaceId/members",
  inviteMember
);

export default router;