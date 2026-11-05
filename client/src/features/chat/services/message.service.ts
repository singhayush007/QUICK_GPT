import { api } from "@/shared/api/api";
import { API_PATHS } from "@/shared/constants/apiPaths.constants";
import { SERVER_URL } from "@/shared/constants/config.constants";
import { tokenStorage } from "@/shared/utils/token.utils";
import type { ImageReplyResponse, ImageSize, ModelsResponse } from "../types/chat.types";

export interface StreamRequest {
  chatId: string;
  prompt: string;
  persona: string;
  regenerate: boolean;
  model: string;
  voice: boolean;
}

export const messageService = {
  models: () => api.get<ModelsResponse>(API_PATHS.message.models),

  /** Image generation can take a while: long timeout. */
  image: (body: { chatId: string; prompt: string; isPublished: boolean; size: ImageSize }, signal?: AbortSignal) =>
    api.post<ImageReplyResponse>(API_PATHS.message.image, body, { signal, timeout: 120000 }),

  /** Opens the SSE stream. Uses fetch (axios can't read a streaming body in the browser). */
  openStream: (body: StreamRequest, signal: AbortSignal): Promise<Response> =>
    fetch(`${SERVER_URL}${API_PATHS.message.stream}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: tokenStorage.get() ?? "" },
      body: JSON.stringify(body),
      signal,
    }),
};
