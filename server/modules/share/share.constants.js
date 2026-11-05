/** Share ids are url-safe base64, 8-24 chars (we generate 16). */
export const SHARE_ID_RE = /^[A-Za-z0-9_-]{8,24}$/;

/** 12 random bytes => 96 bits of entropy: not guessable / enumerable. */
export const SHARE_ID_BYTES = 12;

export const FALLBACK_SHARE_TITLE = "Shared chat";
