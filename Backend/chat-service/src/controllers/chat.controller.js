import * as chatService from "../services/chat.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { roomId } = req.params;
    const { scope, otherUserId, before, limit } = req.query;

    const messages = await chatService.getMessages(roomId, userId, {
      scope,
      otherUserId,
      before,
      limit,
    });

    return res
      .status(200)
      .json(new ApiResponse("Messages fetched successfully", messages));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};
