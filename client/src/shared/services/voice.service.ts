import { api } from "@/shared/api/api";
import { API_PATHS } from "@/shared/constants/apiPaths.constants";
import type { VoicesResponse } from "@/shared/types/voice.types";

const AUDIO_TIMEOUT_MS = 60000;

export const voiceService = {
  list: () => api.get<VoicesResponse>(API_PATHS.voice.list),

  /** Premium voice audio (WAV) for a piece of text. */
  speak: (voice: string, text: string) =>
    api.post<Blob>(API_PATHS.voice.speak, { voice, text }, { responseType: "blob", timeout: AUDIO_TIMEOUT_MS }),

  /** Fixed sample sentence, open to every voice (try before you buy). */
  preview: (voice: string) =>
    api.post<Blob>(API_PATHS.voice.speak, { voice, preview: true }, { responseType: "blob", timeout: AUDIO_TIMEOUT_MS }),
};
