import type { ApiResponse, Chat, ChatMessage } from "@/shared/types";

export type CreateShareResponse = ApiResponse<{ shareId: string }>;
export type RemoveShareResponse = ApiResponse<{ message: string }>;
export type ImportShareResponse = ApiResponse<{ chat: Chat }>;

/** What a public visitor sees: a read-only snapshot (never an email or user id). */
export interface SharedChatData {
  title: string;
  authorName: string;
  sharedAt: string;
  messages: ChatMessage[];
}
export type SharedChatResponse = ApiResponse<{ chat: SharedChatData }>;
