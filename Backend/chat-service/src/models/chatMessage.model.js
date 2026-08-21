import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    scope: {
      type: String,
      enum: ["group", "dm"],
      required: true,
    },

    dmKey: {
      type: String,
      default: null,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ roomId: 1, scope: 1, dmKey: 1, createdAt: 1 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
