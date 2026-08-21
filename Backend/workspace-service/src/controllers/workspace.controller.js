import * as workspaceService from "../services/workspace.service.js";

export const createWorkspace = async (
  req,
  res,
  next
) => {
  try {

    const userId =
      req.headers["x-user-id"];

      console.log("userId", userId)

    const { name, description } = req?.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Workspace name is required",
      });
    }

    const workspace =
      await workspaceService.createWorkspace({
        name,
        description,
        ownerId: userId,
      });

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspace,
    });

  } catch (error) {
    next(error);
  }
};

export const getMyWorkspaces = async (
  req,
  res
) => {
  try {
     const userId = req.headers["x-user-id"];

     console.log("userid-workspace", userId)

    const workspaces =
      await workspaceService.getMyWorkspaces(userId);

    return res.status(200).json({
      success: true,
      message: "Workspaces fetched successfully.",
      count: workspaces.length,
      data: workspaces,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const getWorkspaceById = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.headers["x-user-id"];
    const { workspaceId } = req.params;

    const workspace =
      await workspaceService.getWorkspaceById(workspaceId, userId);

    return res.status(200).json({
      success: true,
      message: "Workspace fetched successfully",
      data: workspace,
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

export const inviteMember = async (
  req,
  res,
  next
) => {
  try {
    const requesterId = req.headers["x-user-id"];
    const { workspaceId } = req.params;
    const { email, role } = req?.body ?? {};

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "email is required",
      });
    }

    const member = await workspaceService.inviteMember(
      workspaceId,
      requesterId,
      { email, role }
    );

    return res.status(201).json({
      success: true,
      message: "Member invited successfully",
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