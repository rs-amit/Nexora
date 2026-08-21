import api from "../lib/api";
import type {
    GetMyWorkspacesResponse,
    GetWorkspaceByIdResponse,
    InviteMemberPayload,
    InviteMemberResponse,
} from "../types/workspace.types";

export const workspaceService = {
    getMyWorkspaces: async (): Promise<GetMyWorkspacesResponse> => {
        const response = await api.get("/workspace/my");

        return response.data;
    },

    getWorkspaceById: async (
        workspaceId: string
    ): Promise<GetWorkspaceByIdResponse> => {
        const response = await api.get(`/workspace/${workspaceId}`);

        return response.data;
    },

    createWorkspace: async (name: string, description?: string) => {
        const response = await api.post("/workspace", {
            name,
            description,
        });

        return response.data;
    },

    inviteMember: async (
        workspaceId: string,
        payload: InviteMemberPayload
    ): Promise<InviteMemberResponse> => {
        const response = await api.post(
            `/workspace/${workspaceId}/members`,
            payload
        );

        return response.data;
    },
};