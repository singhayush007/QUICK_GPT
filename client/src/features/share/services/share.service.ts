import { api } from "@/shared/api/api";
import { API_PATHS } from "@/shared/constants/apiPaths.constants";
import type { CreateShareResponse, ImportShareResponse, RemoveShareResponse, SharedChatResponse } from "../types/share.types";

export const shareService = {
  /** Creates the public link, or refreshes the snapshot of an existing one. */
  create: (chatId: string) => api.post<CreateShareResponse>(API_PATHS.share.create, { chatId }),
  remove: (chatId: string) => api.post<RemoveShareResponse>(API_PATHS.share.remove, { chatId }),
  importChat: (shareId: string) => api.post<ImportShareResponse>(API_PATHS.share.import, { shareId }),
  /** Public: works without logging in. */
  byId: (shareId: string) => api.get<SharedChatResponse>(API_PATHS.share.byId(shareId)),
};
