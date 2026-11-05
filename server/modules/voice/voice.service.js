import crypto from "crypto";
import gemini from "../../config/gemini.client.js";
import { createBoundedCache } from "../../shared/utils/cache.js";
import { badRequest, forbidden } from "../../shared/utils/httpErrors.js";
import { MAX_TTS_CHARS } from "../../shared/constants/limits.js";
import { PREVIEW_TEXT, VOICES, VOICE_CACHE_MAX } from "./voices.constants.js";

// Small in-memory cache: previews and repeated phrases cost no extra TTS quota
const wavCache = createBoundedCache(VOICE_CACHE_MAX);

export const getVoice = (id) => VOICES.find((v) => v.id === id);

/** Free voices: everyone. Pro voices: users with a paid plan. */
export const canUseVoice = (user, voice) => voice.tier === "free" || user?.plan === "pro";

/** Catalogue as shown to a specific user (never exposes provider voice ids). */
export const voicesForUser = (user) =>
  VOICES.map(({ id, name, gender, tier, desc }) => ({
    id, name, gender, tier, desc, locked: !canUseVoice(user, { tier }),
  }));

/**
 * Validates the request and returns WAV audio (cached).
 * Previews are open for every voice (try before you buy); real speech with a
 * Pro voice needs a paid plan.
 * @param {object} user the caller (needs `plan`)
 * @param {{voice: string, text?: unknown, preview?: boolean}} input
 * @returns {Promise<Buffer>} audio/wav bytes
 * @throws {AppError} 400 unknown voice / empty / too long, 403 UPGRADE_REQUIRED
 */
export async function synthesize(user, { voice: voiceId, text, preview }) {
  const voice = getVoice(voiceId);

  if (!voice || !voice.gemini) throw badRequest("Unknown voice");
  if (!preview && !canUseVoice(user, voice)) {
    throw forbidden(
      `The ${voice.name} voice is for paid users. Buy any credit plan to unlock it.`,
      "UPGRADE_REQUIRED"
    );
  }

  const sentence = preview ? PREVIEW_TEXT(voice.name) : String(text || "").trim();
  if (!sentence) throw badRequest("Nothing to say");
  if (sentence.length > MAX_TTS_CHARS) {
    throw badRequest(`Text too long (max ${MAX_TTS_CHARS} characters per request)`);
  }

  const key = `${voice.id}|${crypto.createHash("sha1").update(sentence).digest("hex")}`;
  let wav = wavCache.get(key);
  if (!wav) {
    wav = await gemini.speak(sentence, voice.gemini);
    wavCache.set(key, wav);
  }
  return wav;
}
