import type { ApiResponse } from "@/shared/types";


export type ImageSize = "square" | "landscape" | "portrait";
export type ComposerMode = "text" | "image";

/** What the client asks the AI for. */
export interface SendOptions {
  mode: ComposerMode;
  /** Re-run the last prompt (drops the previous answer). */
  regenerate?: boolean;
  /** Turn spoken in voice mode: keeps the composer draft untouched and asks for a short, speakable answer. */
  voiceTurn?: boolean;
}

/** Reply the server saves for a text/image turn. */
export interface AssistantReply {
  role: "assistant";
  content: string;
  timestamp: number;
  isImage?: boolean;
  isPublished?: boolean;
  model?: string;
}

export type ImageReplyResponse = ApiResponse<{ reply: AssistantReply; credits: number }>;

/** Server-Sent Events emitted by POST /api/message/stream. */
export type StreamEvent =
  | { type: "token"; text: string }
  | { type: "done"; reply: AssistantReply; credits: number }
  | { type: "error"; message: string };

export interface ModelInfo {
  id: string;
  name: string;
  tagline: string;
  tier: "free" | "pro";
  cost: number;
  locked: boolean;
}
export type ModelsResponse = ApiResponse<{ models: ModelInfo[]; plan: string }>;
