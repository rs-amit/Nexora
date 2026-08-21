import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getRoomWorkspace } from "../services/membership.service.js";
import * as shapeService from "../services/shape.service.js";

const boardChannel = (roomId) => `board:${roomId}`;

const serializeShape = (shape) => ({
  _id: shape._id,
  roomId: String(shape.roomId),
  tool: shape.tool,
  data: shape.data,
  createdBy: String(shape.createdBy),
  updatedBy: shape.updatedBy ? String(shape.updatedBy) : null,
  createdAt: shape.createdAt,
  updatedAt: shape.updatedAt,
});

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

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

    // The only place that calls workspace-service over HTTP — every
    // subsequent shape/cursor/laser event on this room is authorized
    // cheaply via `socket.rooms.has(channel)` instead, since draw events
    // fire far more often than a one-time room join.
    socket.on("board:join", async ({ roomId }, ack) => {
      try {
        const workspaceId = await getRoomWorkspace(roomId, socket.userId);

        socket.join(boardChannel(roomId));
        joinedRooms.add(roomId);

        ack?.({ ok: true, workspaceId });
      } catch (error) {
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on("shape:add", async ({ roomId, shape }, ack) => {
      try {
        const channel = boardChannel(roomId);

        if (!socket.rooms.has(channel)) {
          throw new Error("Join the board before adding shapes");
        }

        const created = await shapeService.addShape({
          roomId,
          shape,
          userId: socket.userId,
        });

        const payload = serializeShape(created);

        socket.to(channel).emit("shape:added", { shape: payload });
        ack?.({ ok: true, shape: payload });
      } catch (error) {
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on("shape:update", async ({ roomId, shapeId, data }, ack) => {
      try {
        const channel = boardChannel(roomId);

        if (!socket.rooms.has(channel)) {
          throw new Error("Join the board before updating shapes");
        }

        const updated = await shapeService.updateShape({
          roomId,
          shapeId,
          data,
          userId: socket.userId,
        });

        const payload = serializeShape(updated);

        socket.to(channel).emit("shape:updated", {
          shapeId,
          data: payload.data,
          updatedBy: socket.userId,
        });

        ack?.({ ok: true, shape: payload });
      } catch (error) {
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on("shape:delete", async ({ roomId, shapeId }, ack) => {
      try {
        const channel = boardChannel(roomId);

        if (!socket.rooms.has(channel)) {
          throw new Error("Join the board before deleting shapes");
        }

        await shapeService.deleteShape({ roomId, shapeId });

        socket.to(channel).emit("shape:deleted", { shapeId });
        ack?.({ ok: true });
      } catch (error) {
        ack?.({ ok: false, error: error.message });
      }
    });

    // Ephemeral, never persisted — dropped under backpressure via .volatile.
    socket.on("cursor:move", ({ roomId, x, y }) => {
      const channel = boardChannel(roomId);
      if (!socket.rooms.has(channel)) return;

      socket.to(channel).volatile.emit("cursor:move", {
        userId: socket.userId,
        x,
        y,
      });
    });

    socket.on("laser:path", ({ roomId, points, color }) => {
      const channel = boardChannel(roomId);
      if (!socket.rooms.has(channel)) return;

      socket.to(channel).volatile.emit("laser:path", {
        userId: socket.userId,
        points,
        color,
      });
    });

    socket.on("disconnect", () => {
      joinedRooms.clear();
    });
  });

  return io;
};
