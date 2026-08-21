import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Workspace",
  workspaceSchema
);