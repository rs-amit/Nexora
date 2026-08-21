import { ChatMessage } from "../models/chatMessage.model.js";
import {
  getRoomWorkspace,
  getWorkspaceMemberIds,
} from "./membership.service.js";
import { buildDmKey } from "../utils/dmKey.js";
import { ApiError } from "../utils/apiError.js";

const DEFAULT_LIMIT = 30;

export const getMessages = async (
  roomId,
  userId,
  { scope, otherUserId, before, limit }
) => {
  const workspaceId = await getRoomWorkspace(roomId, userId);

  let dmKey = null;

  if (scope === "dm") {
    if (!otherUserId) {
      throw new ApiError(400, "otherUserId is required for dm scope");
    }

    const memberIds = await getWorkspaceMemberIds(workspaceId, userId);

    if (!memberIds.has(String(otherUserId))) {
      throw new ApiError(403, "That user is not a member of this room");
    }

    dmKey = buildDmKey(userId, otherUserId);
  }

  const query = { roomId, scope, dmKey };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await ChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || DEFAULT_LIMIT, 100))
    .lean();

  return messages.reverse();
};
