/**
 * Voice catalogue for spoken replies. `gemini` is the prebuilt Gemini TTS voice.
 * Free voices are open to everyone; Pro voices need a paid plan (enforced on the
 * server). "device" = the browser's own built-in voice: free, offline, no server call.
 */
export const VOICES = [
  { id: "device", name: "Device voice", gender: "any", tier: "free", desc: "Your browser's built-in voice · works offline" },
  // male ×4
  { id: "puck", name: "Puck", gender: "male", tier: "free", desc: "Upbeat & friendly", gemini: "Puck" },
  { id: "charon", name: "Charon", gender: "male", tier: "pro", desc: "Deep & informative", gemini: "Charon" },
  { id: "fenrir", name: "Fenrir", gender: "male", tier: "pro", desc: "Energetic & excitable", gemini: "Fenrir" },
  { id: "orus", name: "Orus", gender: "male", tier: "pro", desc: "Firm & confident", gemini: "Orus" },
  // female ×2
  { id: "kore", name: "Kore", gender: "female", tier: "free", desc: "Clear & firm", gemini: "Kore" },
  { id: "aoede", name: "Aoede", gender: "female", tier: "pro", desc: "Warm & breezy", gemini: "Aoede" },
];

/** How many synthesised clips the in-memory cache keeps. */
export const VOICE_CACHE_MAX = 80;

/** Sentence spoken when a user previews a voice. */
export const PREVIEW_TEXT = (name) =>
  `Hi, I'm ${name}. This is how I sound when I read your answers out loud.`;
