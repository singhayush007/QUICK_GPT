/** Every key QuickGPT writes to localStorage (kept stable so existing sessions survive). */
export const STORAGE_KEYS = {
  token: "token",
  theme: "theme",
  model: "model",
  persona: "persona",
  voice: "voice",
  voiceLang: "voiceLang",
  liveTab: "liveTab",
  liveCity: "liveCity",
} as const;
