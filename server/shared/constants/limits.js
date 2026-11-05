/** Single source of truth for sizes, limits and prices used across modules. */

// --- request / input limits ---
export const JSON_BODY_LIMIT = "100kb";
export const MAX_PROMPT_LENGTH = 4000;
export const MAX_TTS_CHARS = 900;
export const MAX_SHARED_MESSAGES = 200;
export const MAX_CHAT_NAME_LENGTH = 60;
export const MAX_CITY_LENGTH = 60;
export const CHAT_TITLE_MAX = 40;
export const HISTORY_LIMIT = 10; // messages sent to the AI as context
export const PUBLISHED_IMAGES_LIMIT = 200;
export const PURCHASE_HISTORY_LIMIT = 20;

// --- credits ---
export const IMAGE_CREDIT_COST = 2;
export const TEXT_CREDIT_COST = { lite: 1, flash: 1, pro: 3 }; // mirrored by MODELS[].cost
export const SIGNUP_CREDITS = 20;

// --- auth ---
export const MIN_PASSWORD_LENGTH = 6;
export const JWT_EXPIRES_IN = "30d";

// --- rate limits (per IP) ---
const MINUTE = 60 * 1000;
export const RATE_LIMITS = {
  auth: { windowMs: 15 * MINUTE, limit: 30 },
  message: { windowMs: MINUTE, limit: 30 },
  publicShare: { windowMs: MINUTE, limit: 60 },
  live: { windowMs: MINUTE, limit: 90 },
  voice: { windowMs: MINUTE, limit: 40 },
};
