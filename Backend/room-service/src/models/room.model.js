import mongoose from "mongoose"

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Untitled Room",
    trim: true
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      role: {
        type: String,
        enum: ["owner", "editor", "viewer"],
        default: "editor"
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  inviteCode: {
    type: String,
    required: true
  },

  visibility: {
    type: String,
    enum: ["private", "public"],
    default: "public"
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export const Room = mongoose.model("Room", roomSchema)