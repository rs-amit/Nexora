import mongoose from "mongoose";

export const ROOM_STATUSES = ["ACTIVE", "IDLE"];
export const ROOM_VISIBILITIES = ["OPEN", "RESTRICTED"];

const roomSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ROOM_STATUSES,
      default: "ACTIVE",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    visibility: {
      type: String,
      enum: ROOM_VISIBILITIES,
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ workspaceId: 1 });

export default mongoose.model("Room", roomSchema, "workspace_rooms");
