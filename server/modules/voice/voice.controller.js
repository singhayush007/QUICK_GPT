import * as voiceService from "./voice.service.js";
import { AppError, errorBody } from "../../shared/utils/httpErrors.js";

/** GET /api/voice/list — catalogue with the caller's lock state. */
export const listVoices = (req, res) =>
  res.json({ success: true, voices: voiceService.voicesForUser(req.user), plan: req.user.plan });

/**
 * POST /api/voice/speak  { voice, text }  or  { voice, preview: true }
 * Responds with audio/wav.
 */
export const speak = async (req, res) => {
  const { voice, text, preview } = req.body;

  try {
    const wav = await voiceService.synthesize(req.user, { voice, text, preview });
    res.set({ "Content-Type": "audio/wav", "Content-Length": wav.length, "Cache-Control": "private, max-age=3600" });
    res.send(wav);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json(errorBody(error));
    }
    console.error("TTS error:", error.message);
    const status = error.status === 429 ? 429 : 502;
    res.status(status).json({
      success: false,
      message: status === 429 ? "Voice service is busy, please try again shortly." : "Couldn't generate the voice right now.",
    });
  }
};
