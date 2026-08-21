export type RoomStatus = "ACTIVE" | "IDLE";
export type RoomVisibility = "OPEN" | "RESTRICTED";

export interface Room {
  _id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: RoomStatus;
  visibility: RoomVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomMemberEntry {
  userId: string;
  role: string;
  joinedAt: string;
}

export interface RoomMembersData {
  roomId: string;
  workspaceId: string;
  visibility: RoomVisibility;
  members: RoomMemberEntry[];
}

export interface GetRoomMembersResponse {
  success: boolean;
  message: string;
  data: RoomMembersData;
}

export interface AddRoomMemberResponse {
  success: boolean;
  message: string;
  data: RoomMemberEntry;
}

export interface CreateRoomResponse {
  success: boolean;
  message: string;
  data: Room;
}

export interface GetWorkspaceRoomsResponse {
  success: boolean;
  message: string;
  count: number;
  data: Room[];
}

export interface GetRoomByIdResponse {
  success: boolean;
  message: string;
  data: Room;
}
