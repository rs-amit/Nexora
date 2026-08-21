import * as roomService from "../services/room.service.js";

export const createRoom = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.headers["x-user-id"];
    const { workspaceId } = req.params;
    const { name, description } = req?.body ?? {};

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    const room = await roomService.createRoom({
      workspaceId,
      name,
      description,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
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

export const getRoomsByWorkspace = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.headers["x-user-id"];
    const { workspaceId } = req.params;

    const rooms = await roomService.getRoomsByWorkspace(workspaceId, userId);

    return res.status(200).json({
      success: true,
      message: "Rooms fetched successfully",
      count: rooms.length,
      data: rooms,
    });
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

export const getRoomById = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.headers["x-user-id"];
    const { roomId } = req.params;

    const room = await roomService.getRoomById(roomId, userId);

    return res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      data: room,
    });
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

export const getRoomMembers = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.headers["x-user-id"];
    const { roomId } = req.params;

    const result = await roomService.getRoomMembers(roomId, userId);

    return res.status(200).json({
      success: true,
      message: "Room members fetched successfully",
      data: result,
    });
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

export const addRoomMember = async (
  req,
  res,
  next
) => {
  try {
    const requesterId = req.headers["x-user-id"];
    const { roomId } = req.params;
    const { userId } = req?.body ?? {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const member = await roomService.addRoomMember(roomId, requesterId, userId);

    return res.status(201).json({
      success: true,
      message: "Member added to room successfully",
      data: member,
    });
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

export const removeRoomMember = async (
  req,
  res,
  next
) => {
  try {
    const requesterId = req.headers["x-user-id"];
    const { roomId, userId } = req.params;

    await roomService.removeRoomMember(roomId, requesterId, userId);

    return res.status(200).json({
      success: true,
      message: "Member removed from room successfully",
    });
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
