import { createRoomService } from "../services/room.service.js"
import { ApiResponse } from "../Utils/apiResponse.js";

export const createRoom = async (req, res, next) => {

  console.log("reached in room service")

  try {

    const userId = req.user?.userId;

    console.log("userId", userId)

    const room = await createRoomService(userId);

    return res.status(201).json(
      new ApiResponse(
        "Room created successfully",
        room
      )
    );

  } catch (error) {

    next(error);
  }
};