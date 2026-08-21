import mongoose from "mongoose";

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    role: {
      type: String,
      enum: ["OWNER", "EDITOR", "VIEWER"],
      default: "VIEWER",
    },
  },
  {
    timestamps: true,
  }
);

workspaceMemberSchema.index(
  {
    workspaceId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
);