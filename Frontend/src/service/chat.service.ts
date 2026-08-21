import api from "../lib/api";
import type { ChatScope, GetChatMessagesResponse } from "../types/chat.types";

export interface GetMessagesParams {
  scope: ChatScope;
  otherUserId?: string;
  before?: string;
}

export const chatService = {
  getMessages: async (
    roomId: string,
    params: GetMessagesParams
  ): Promise<GetChatMessagesResponse> => {
    const response = await api.get(`/chat/rooms/${roomId}/messages`, {
      params,
    });

    return response.data;
  },
};
