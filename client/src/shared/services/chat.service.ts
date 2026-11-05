import { api } from "@/shared/api/api";
import { API_PATHS } from "@/shared/constants/apiPaths.constants";
import type { ChatResponse, ListChatsResponse, MessageResponse } from "@/shared/types/chat.types";

export const chatService = {
  list: () => api.get<ListChatsResponse>(API_PATHS.chat.list),
  create: () => api.get<ChatResponse>(API_PATHS.chat.create),
  rename: (chatId: string, name: string) => api.post<ChatResponse>(API_PATHS.chat.rename, { chatId, name }),
  pin: (chatId: string, pinned: boolean) => api.post<ChatResponse>(API_PATHS.chat.pin, { chatId, pinned }),
  remove: (chatId: string) => api.post<MessageResponse>(API_PATHS.chat.remove, { chatId }),
};
