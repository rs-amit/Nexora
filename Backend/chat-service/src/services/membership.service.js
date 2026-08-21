import axios from "axios";
import { ApiError } from "../utils/apiError.js";

const mapAxiosError = (error, fallbackMessage) => {
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || fallbackMessage;

  return new ApiError(status, message, "MEMBERSHIP_CHECK_FAILED");
};

/*
Confirms the user can access this room (i.e. is a member of the room's
workspace) and returns the workspaceId. Reuses workspace-service's existing
getRoomById, which already asserts membership.
*/
export const getRoomWorkspace = async (roomId, userId) => {
  try {
    const response = await axios.get(
      `${process.env.WORKSPACE_SERVICE}/workspace/rooms/${roomId}`,
      { headers: { "x-user-id": userId } }
    );

    return response.data.data.workspaceId;
  } catch (error) {
    throw mapAxiosError(error, "You do not have access to this room");
  }
};

/*
Returns the set of userIds that belong to the given workspace, reusing
workspace-service's existing getWorkspaceById (which already returns members).
*/
export const getWorkspaceMemberIds = async (workspaceId, userId) => {
  try {
    const response = await axios.get(
      `${process.env.WORKSPACE_SERVICE}/workspace/${workspaceId}`,
      { headers: { "x-user-id": userId } }
    );

    const members = response.data.data.members || [];

    return new Set(members.map((member) => String(member.userId)));
  } catch (error) {
    throw mapAxiosError(error, "You do not have access to this workspace");
  }
};
