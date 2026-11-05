import type { ApiResponse } from "./api.types";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: number;
  isImage?: boolean;
  isPublished?: boolean;
  /** Model id (`lite` | `flash` | `pro`) that produced an assistant reply. */
  model?: string;
}

export interface Chat {
  _id: string;
  name: string;
  userName?: string;
  pinned?: boolean;
  shareId?: string;
  messages: ChatMessage[];
  createdAt?: string;
  updatedAt: string;
}

export type ListChatsResponse = ApiResponse<{ chats: Chat[] }>;
export type ChatResponse = ApiResponse<{ chat: Chat }>;
export type MessageResponse = ApiResponse<{ message?: string }>;
