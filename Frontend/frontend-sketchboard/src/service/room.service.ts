import api from "../lib/api";
import type {
  CreateRoomResponse,
  GetWorkspaceRoomsResponse,
  GetRoomByIdResponse,
  GetRoomMembersResponse,
  AddRoomMemberResponse,
} from "../types/room.types";

// Standalone "instant meeting" room, unrelated to a workspace.
export const createRoom = async () => {
  const response = await api.post("/rooms");
  return response.data;
};

export interface CreateWorkspaceRoomPayload {
  name: string;
  description?: string;
}

export const roomService = {
  createWorkspaceRoom: async (
    workspaceId: string,
    payload: CreateWorkspaceRoomPayload
  ): Promise<CreateRoomResponse> => {
    const response = await api.post(
      `/workspace/${workspaceId}/rooms`,
      payload
    );

    return response.data;
  },

  getWorkspaceRooms: async (
    workspaceId: string
  ): Promise<GetWorkspaceRoomsResponse> => {
    const response = await api.get(`/workspace/${workspaceId}/rooms`);

    return response.data;
  },

  getRoomById: async (roomId: string): Promise<GetRoomByIdResponse> => {
    const response = await api.get(`/workspace/rooms/${roomId}`);

    return response.data;
  },

  getRoomMembers: async (roomId: string): Promise<GetRoomMembersResponse> => {
    const response = await api.get(`/workspace/rooms/${roomId}/members`);

    return response.data;
  },

  addRoomMember: async (
    roomId: string,
    userId: string
  ): Promise<AddRoomMemberResponse> => {
    const response = await api.post(`/workspace/rooms/${roomId}/members`, {
      userId,
    });

    return response.data;
  },

  removeRoomMember: async (roomId: string, userId: string): Promise<void> => {
    await api.delete(`/workspace/rooms/${roomId}/members/${userId}`);
  },
};
