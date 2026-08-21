export type ChatScope = "group" | "dm";

export interface ChatMessage {
  _id: string;
  roomId: string;
  scope: ChatScope;
  dmKey: string | null;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface GetChatMessagesResponse {
  success: boolean;
  message: string;
  data: ChatMessage[];
}
