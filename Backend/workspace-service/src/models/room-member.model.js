import mongoose from "mongoose";

const roomMemberSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

roomMemberSchema.index(
  {
    roomId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "RoomMember",
  roomMemberSchema,
  "workspace_room_members"
);
