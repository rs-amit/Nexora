import express from "express";

import {
  createRoom,
  getRoomsByWorkspace,
  getRoomById,
  getRoomMembers,
  addRoomMember,
  removeRoomMember,
} from "../controllers/room.controller.js";

const router = express.Router();

router.post(
  "/:workspaceId/rooms",
  createRoom
);

router.get(
  "/:workspaceId/rooms",
  getRoomsByWorkspace
);

router.get(
  "/rooms/:roomId",
  getRoomById
);

router.get(
  "/rooms/:roomId/members",
  getRoomMembers
);

router.post(
  "/rooms/:roomId/members",
  addRoomMember
);

router.delete(
  "/rooms/:roomId/members/:userId",
  removeRoomMember
);

export default router;
