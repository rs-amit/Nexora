export type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";

export interface WorkspaceMemberEntry {
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface WorkspaceLastActivity {
  at: string;
  userId: string;
}

export interface WorkspaceStats {
  memberCount: number;
  newMembersThisWeek: number;
  roomCount: number;
  activeRoomCount: number;
  lastActivity: WorkspaceLastActivity;
}

export interface WorkspaceDetails {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMemberEntry[];
  stats: WorkspaceStats;
}

export interface Workspace {
  _id: string;
  workspaceId: WorkspaceDetails;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
}

export interface GetMyWorkspacesResponse {
  success: boolean;
  message: string;
  count: number;
  data: Workspace[];
}

export interface GetWorkspaceByIdResponse {
  success: boolean;
  message: string;
  data: WorkspaceDetails;
}

export type InvitableRole = "EDITOR" | "VIEWER";

export interface InviteMemberPayload {
  email: string;
  role: InvitableRole;
}

export interface InviteMemberResponse {
  success: boolean;
  message: string;
  data: WorkspaceMemberEntry;
}