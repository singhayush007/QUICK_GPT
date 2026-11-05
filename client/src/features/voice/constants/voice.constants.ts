import type { VoicePhase } from "../types/voice.types";

/** How long you must stay quiet before what you said is sent to the AI. */
export const SILENCE_MS = 3000;

/** Short pause after the AI finishes talking so the mic doesn't catch the tail of its own voice. */
export const LISTEN_RESUME_DELAY_MS = 350;

export const PHASE_TEXT: Record<VoicePhase, string> = {
  listening: "Listening… just start talking",
  hearing: "I'm listening…",
  thinking: "Thinking…",
  speaking: "Speaking — tap to interrupt",
};

export const ORB_CLASSES: Record<VoicePhase, string> = {
  listening: "animate-pulse",
  hearing: "scale-110",
  thinking: "animate-spin [animation-duration:2.5s]",
  speaking: "animate-pulse [animation-duration:0.7s]",
};

export const VOICE_SECTIONS: ReadonlyArray<{ title: string; match: (gender: string, id: string) => boolean }> = [
  { title: "Built in", match: (_g, id) => id === "device" },
  { title: "Male voices", match: (g) => g === "male" },
  { title: "Female voices", match: (g) => g === "female" },
];

export const FALLBACK_VOICE = {
  id: "device",
  name: "Device voice",
  gender: "any",
  tier: "free",
  desc: "Your browser's built-in voice",
  locked: false,
} as const;
