import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { ChatMessage } from "../models/chatMessage.model.js";
import {
  getRoomWorkspace,
  getWorkspaceMemberIds,
} from "../services/membership.service.js";
import { buildDmKey } from "../utils/dmKey.js";

const groupChannel = (roomId) => `room:${roomId}:group`;
const dmChannel = (roomId, dmKey) => `room:${roomId}:dm:${dmKey}`;

const serializeMessage = (message) => ({
  _id: message._id,
  roomId: message.roomId,
  scope: message.scope,
  dmKey: message.dmKey,
  senderId: message.senderId,
  text: message.text,
  createdAt: message.createdAt,
});

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // roomId -> Map<userId, activeSocketCount> (survives multiple tabs per user)
  const roomPresence = new Map();

  const addPresence = (roomId, userId) => {
    if (!roomPresence.has(roomId)) roomPresence.set(roomId, new Map());

    const users = roomPresence.get(roomId);

    users.set(userId, (users.get(userId) || 0) + 1);
  };

  const removePresence = (roomId, userId) => {
    const users = roomPresence.get(roomId);

    if (!users) return;

    const remaining = (users.get(userId) || 0) - 1;

    if (remaining <= 0) {
      users.delete(userId);
    } else {
      users.set(userId, remaining);
    }

    if (users.size === 0) roomPresence.delete(roomId);
  };

  const broadcastPresence = (roomId) => {
    const users = roomPresence.get(roomId);

    io.to(groupChannel(roomId)).emit("presence:update", {
      roomId,
      onlineUserIds: users ? [...users.keys()] : [],
    });
  };

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      socket.userId = String(decoded.userId);

      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const joinedRooms = new Set();

    socket.on("room:join", async ({ roomId }, ack) => {
      try {
        const workspaceId = await getRoomWorkspace(roomId, socket.userId);

        socket.join(groupChannel(roomId));
        joinedRooms.add(roomId);

        addPresence(roomId, socket.userId);
        broadcastPresence(roomId);

        ack?.({ ok: true, workspaceId });
      } catch (error) {
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on("dm:open", async ({ roomId, otherUserId }, ack) => {
      try {
        const workspaceId = await getRoomWorkspace(roomId, socket.userId);
        const memberIds = await getWorkspaceMemberIds(
          workspaceId,
          socket.userId
        );

        if (!memberIds.has(String(otherUserId))) {
          throw new Error("That user is not a member of this room");
        }

        const dmKey = buildDmKey(socket.userId, otherUserId);

        socket.join(dmChannel(roomId, dmKey));

        ack?.({ ok: true, dmKey });
      } catch (error) {
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on(
      "message:send",
      async ({ roomId, scope, text, otherUserId }, ack) => {
        try {
          const trimmed = (text || "").trim();

          if (!trimmed) {
            throw new Error("Message text is required");
          }

          const dmKey =
            scope === "dm" ? buildDmKey(socket.userId, otherUserId) : null;

          const channel =
            scope === "group" ? groupChannel(roomId) : dmChannel(roomId, dmKey);

          if (!socket.rooms.has(channel)) {
            throw new Error("Join the conversation before sending messages");
          }

          const message = await ChatMessage.create({
            roomId,
            scope,
            dmKey,
            senderId: socket.userId,
            text: trimmed,
          });

          const payload = serializeMessage(message);

          io.to(channel).emit("message:new", payload);

          ack?.({ ok: true, message: payload });
        } catch (error) {
          ack?.({ ok: false, error: error.message });
        }
      }
    );

    socket.on("disconnect", () => {
      for (const roomId of joinedRooms) {
        removePresence(roomId, socket.userId);
        broadcastPresence(roomId);
      }
    });
  });

  return io;
};
