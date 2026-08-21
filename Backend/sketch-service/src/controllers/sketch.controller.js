import * as shapeService from "../services/shape.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const getShapes = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { roomId } = req.params;

    const shapes = await shapeService.getShapesByRoom(roomId, userId);

    return res
      .status(200)
      .json(new ApiResponse("Shapes fetched successfully", shapes));
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
