import type { ApiResponse } from "@/shared/types";

/** One selectable voice. `device` = the browser's own speech synthesis. */
export interface VoiceInfo {
  id: string;
  name: string;
  gender: "male" | "female" | "any";
  tier: "free" | "pro";
  desc: string;
  locked: boolean;
}
export type VoicesResponse = ApiResponse<{ voices: VoiceInfo[]; plan: string }>;

/** Controller returned by the speak engine. `done` always resolves (also when cancelled). */
export interface SpeakController {
  cancel: () => void;
  done: Promise<void>;
}

export interface SpeakOptions {
  voice?: string;
  lang?: string;
  /** Called once when a premium voice fails and the device voice takes over. */
  onFallback?: (error: unknown) => void;
}

// The Web Speech API is not in lib.dom.d.ts: minimal structural types for what we use.
export interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
export interface SpeechRecognitionErrorEventLike {
  error: string;
}
export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
