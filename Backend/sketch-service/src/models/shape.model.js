import mongoose from "mongoose";

// Persisted tools. "laser" is deliberately excluded — it's an ephemeral,
// presentational pointer trail, relayed live but never saved.
export const SHAPE_TOOLS = [
  "pencil",
  "eraser",
  "line",
  "arrow",
  "rectangle",
  "circle",
  "diamond",
  "triangle",
  "text",
  "sticky",
  "table",
  "relation",
];

const shapeSchema = new mongoose.Schema(
  {
    // Client-generated id (crypto.randomUUID()), not a Mongo ObjectId — lets
    // the client reference a shape for update/delete without a round trip.
    _id: {
      type: String,
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    tool: {
      type: String,
      enum: SHAPE_TOOLS,
      required: true,
    },

    // Opaque per-tool payload: color, width, points, startX/Y, endX/Y, text,
    // noteColor, etc. — the server doesn't need to understand its shape.
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true, _id: false }
);

shapeSchema.index({ roomId: 1, createdAt: 1 });

export const Shape = mongoose.model("Shape", shapeSchema, "sketch_shapes");
