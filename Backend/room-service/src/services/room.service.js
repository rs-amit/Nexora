import { Room } from "../models/room.model.js";
import axios from "axios";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { ApiError } from "../Utils/apiError.js";

const generateInviteCode = () => {
  return crypto.randomBytes(6).toString("hex");
};

export const createRoomService = async (userId) => {

  let inviteCode;
  let existingRoom;

  do {

    inviteCode = generateInviteCode();

    existingRoom = await Room.findOne({
      inviteCode
    });

  } while (existingRoom);


  console.log("owner", userId )

  const room = await Room.create({

    owner: userId,

    inviteCode,

    participants: [
      {
        user: userId,
        role: "owner"
      }
    ]
  });

  // Safety check
  if (!room) {

    throw new ApiError(
      500,
      "Failed to create room",
      "ROOM_CREATION_FAILED"
    );
  }

  // Return clean response data
  return {
    roomId: room._id,
    name: room.name,
    visibility: room.visibility,
    inviteLink: `${process.env.FRONTEND_URL}/room/${room._id}?invite=${inviteCode}`
  };
};