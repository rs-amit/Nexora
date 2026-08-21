import { Shape } from "../models/shape.model.js";
import { getRoomWorkspace } from "./membership.service.js";

/*
Fetching the snapshot is a fresh, unauthenticated-by-socket HTTP request, so
it authorizes via workspace-service every time. The socket mutation helpers
below deliberately do NOT call getRoomWorkspace — the socket layer already
authorized the user once at `board:join` and checks `socket.rooms.has(...)`
on every subsequent event, since draw events fire far more often than a
REST fetch and shouldn't cost a network round-trip each time.
*/
export const getShapesByRoom = async (roomId, userId) => {
  await getRoomWorkspace(roomId, userId);

  return Shape.find({ roomId }).sort({ createdAt: 1 }).lean();
};

export const addShape = async ({ roomId, shape, userId }) => {
  const created = await Shape.create({
    _id: shape.id,
    roomId,
    tool: shape.tool,
    data: shape.data,
    createdBy: userId,
  });

  return created.toObject();
};

export const updateShape = async ({ roomId, shapeId, data, userId }) => {
  const updated = await Shape.findOneAndUpdate(
    { _id: shapeId, roomId },
    { $set: { data, updatedBy: userId } },
    { new: true }
  ).lean();

  if (!updated) {
    throw new Error("Shape not found");
  }

  return updated;
};

export const deleteShape = async ({ roomId, shapeId }) => {
  const deleted = await Shape.deleteOne({ _id: shapeId, roomId });

  if (deleted.deletedCount === 0) {
    throw new Error("Shape not found");
  }
};
