import axios from "axios";
import { envSet } from "../shared/utils/env.js";
import { pcmToWav, DEFAULT_PCM_SAMPLE_RATE } from "../shared/utils/wav.js";

/**
 * Gemini REST wrapper.
 * - reads env lazily (safe with dotenv / serverless)
 * - sends the API key in a header instead of the URL (keeps it out of logs)
 * - supports a system instruction, plain and streaming (SSE) generation, and TTS
 * - GEMINI_BASE_URL can point to a mock server for local testing
 */
const DEFAULT_TEXT_MODELS = ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-flash-latest"];

const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const TEXT_TIMEOUT_MS = 30000;
const TTS_TIMEOUT_MS = 45000;

const baseURL = () => process.env.GEMINI_BASE_URL || DEFAULT_BASE_URL;

const headers = () => ({
  "Content-Type": "application/json",
  "x-goog-api-key": process.env.GEMINI_API_KEY,
});

/** OpenAI-style messages -> Gemini contents (merges consecutive same-role turns). */
export const toGeminiContents = (messages) => {
  const contents = [];
  for (const msg of messages) {
    if (msg.role !== "user" && msg.role !== "assistant") continue;
    const role = msg.role === "assistant" ? "model" : "user";
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${msg.content}`;
    } else {
      contents.push({ role, parts: [{ text: msg.content }] });
    }
  }
  // Gemini requires the first turn to be from the user
  while (contents.length && contents[0].role !== "user") contents.shift();
  return contents;
};

const buildPayload = (messages, systemPrompt) => {
  const payload = { contents: toGeminiContents(messages) };
  if (systemPrompt) {
    payload.systemInstruction = { parts: [{ text: systemPrompt }] };
  }
  return payload;
};

const extractError = (error) =>
  error?.response?.data?.error?.message || error?.message || "Gemini failed";

/**
 * Build ONE useful error out of everything that failed in a model chain.
 * Priority 429 (quota / rate limit) > 5xx (overloaded) > anything else > 404 (retired model), so a dead
 * fallback model never hides the real reason, and the message is safe to show to the user.
 */
const chainFailure = (errors) => {
  const rank = (e) => {
    const s = e?.response?.status;
    if (s === 429) return 0;
    if (s >= 500) return 1;
    if (s === 404) return 3;
    return 2;
  };
  const best = [...errors].filter(Boolean).sort((a, b) => rank(a) - rank(b))[0];
  const status = best?.response?.status;
  let message;
  let code = status;
  if (status === 429) message = "The AI is rate limited right now (free-tier quota reached). Please try again in a minute.";
  else if (status >= 500) { message = "The AI is busy right now. Please try again in a moment."; code = 503; }
  else if (status === 404) message = "The configured AI models are no longer available. Update GEMINI_MODELS_* in the server env.";
  else message = `Gemini API error: ${extractError(best)}`;
  const err = new Error(message);
  err.status = code;
  return err;
};

const textOf = (data) =>
  (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || "")
    .join("");

const TTS_MODELS = process.env.GEMINI_TTS_MODEL
  ? [process.env.GEMINI_TTS_MODEL]
  : ["gemini-2.5-flash-preview-tts", "gemini-3.8-flash-lite-tts"];

const requireKey = () => {
  if (!envSet("GEMINI_API_KEY")) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
};

const geminiAPI = {
  isConfigured: () => envSet("GEMINI_API_KEY"),

  /** Text-to-speech with a Gemini prebuilt voice. Resolves with a WAV Buffer. */
  async speak(text, voiceName) {
    requireKey();
    let lastError = null;
    for (const model of TTS_MODELS) {
      try {
        const { data } = await axios.post(
          `${process.env.GEMINI_TTS_BASE_URL || baseURL()}/models/${model}:generateContent`,
          {
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            },
          },
          { headers: headers(), timeout: TTS_TIMEOUT_MS }
        );
        const part = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
        if (!part) continue;
        const rate =
          Number(/rate=(\d+)/.exec(part.inlineData.mimeType || "")?.[1]) ||
          DEFAULT_PCM_SAMPLE_RATE;
        return pcmToWav(Buffer.from(part.inlineData.data, "base64"), rate);
      } catch (error) {
        lastError = error;
        const status = error?.response?.status;
        if (status === 401 || status === 403) break;
      }
    }
    const err = new Error(`Voice generation failed: ${extractError(lastError)}`);
    err.status = lastError?.response?.status;
    throw err;
  },

  /** Non-streaming generation. Returns an OpenAI-shaped completion. */
  async generateText(messages, { systemPrompt, models } = {}) {
    requireKey();
    const payload = buildPayload(messages, systemPrompt);
    const errors = [];

    for (const model of models?.length ? models : DEFAULT_TEXT_MODELS) {
      try {
        const { data } = await axios.post(
          `${baseURL()}/models/${model}:generateContent`,
          payload,
          { headers: headers(), timeout: TEXT_TIMEOUT_MS }
        );
        const text = textOf(data);
        if (text) {
          return { model, choices: [{ message: { role: "assistant", content: text } }] };
        }
      } catch (error) {
        errors.push(error);
        // Bad request / auth errors will not be fixed by trying another model
        const status = error?.response?.status;
        if (status === 400 || status === 401 || status === 403) break;
      }
    }
    throw chainFailure(errors);
  },

  /**
   * Streaming generation. Calls onToken(text) for every chunk and resolves
   * with the full text.
   */
  async streamText(messages, onToken, { systemPrompt, signal, models } = {}) {
    requireKey();
    const payload = buildPayload(messages, systemPrompt);
    const errors = [];

    for (const model of models?.length ? models : DEFAULT_TEXT_MODELS) {
      let full = "";
      try {
        const res = await axios.post(
          `${baseURL()}/models/${model}:streamGenerateContent?alt=sse`,
          payload,
          { headers: headers(), responseType: "stream", timeout: TEXT_TIMEOUT_MS, signal }
        );
        await new Promise((resolve, reject) => {
          let buffer = "";
          res.data.on("data", (chunk) => {
            buffer += chunk.toString("utf8");
            const lines = buffer.split("\n");
            buffer = lines.pop();
            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              const json = line.slice(5).trim();
              if (!json) continue;
              try {
                const text = textOf(JSON.parse(json));
                if (text) {
                  full += text;
                  onToken(text);
                }
              } catch {
                /* ignore partial / non-JSON frames */
              }
            }
          });
          res.data.on("end", resolve);
          res.data.on("error", reject);
        });
        if (full) return full;
      } catch (error) {
        if (signal?.aborted) throw error;
        // If we already streamed part of an answer, don't restart on another model
        if (full) return full;
        errors.push(error);
        const status = error?.response?.status;
        if (status === 400 || status === 401 || status === 403) break;
      }
    }
    throw chainFailure(errors);
  },
};

export default geminiAPI;
