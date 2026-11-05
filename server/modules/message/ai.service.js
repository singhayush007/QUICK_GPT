import gemini from "../../config/gemini.client.js";
import getOpenRouter, { DEFAULT_OPENROUTER_MODEL } from "../../config/openrouter.client.js";
import { envSet } from "../../shared/utils/env.js";
import { HISTORY_LIMIT } from "../../shared/constants/limits.js";
import { PERSONAS, SYSTEM_PROMPT, VOICE_HINT } from "./personas.constants.js";

/** System prompt for a persona id (unknown ids fall back to the default). */
export const systemPromptFor = (persona, voice = false) => {
  const extra = PERSONAS[persona];
  // "PERSONA:" must stay a marker (the test mock keys on it). The wording tells the model that the persona
  // wins over the style of earlier turns — otherwise a long chat history drowns it out.
  const base = extra
    ? `${SYSTEM_PROMPT}\n\nPERSONA: ${extra}\nThe user chose this persona for THIS conversation. Apply it to every reply from now on, even if earlier replies in the history were written in a different style.`
    : SYSTEM_PROMPT;
  return voice ? `${base}\n\nVOICE MODE: ${VOICE_HINT}` : base;
};

/** Last N text messages of a chat, in the shape the AI providers expect. */
export const buildHistory = (chat, limit = HISTORY_LIMIT) =>
  chat.messages
    .filter((m) => !m.isImage)
    .slice(-limit)
    .map((m) => ({ role: m.role, content: m.content }));

const wantsGeminiFirst = () =>
  gemini.isConfigured() &&
  (process.env.USE_GEMINI === "true" || !envSet("OPENROUTER_API_KEY"));

const openRouterComplete = async (messages, systemPrompt) => {
  const model = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;
  const completion = await getOpenRouter().chat.completions.create({
    model,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });
  return completion.choices?.[0]?.message?.content;
};

/**
 * Provider chain with real fallback in BOTH directions:
 * Gemini -> OpenRouter, or OpenRouter -> Gemini, depending on USE_GEMINI.
 * @param {{role: string, content: string}[]} messages
 * @param {string} [systemPrompt]
 * @param {string[]} [chain] Gemini model ids to try, in order
 * @returns {Promise<string>} the reply text
 */
export async function generateReply(messages, systemPrompt = SYSTEM_PROMPT, chain) {
  const hasOpenRouter = envSet("OPENROUTER_API_KEY");
  const providers = [];
  const gem = () =>
    gemini
      .generateText(messages, { systemPrompt, models: chain })
      .then((r) => r.choices[0].message.content);

  if (wantsGeminiFirst()) {
    providers.push(gem);
    if (hasOpenRouter) providers.push(() => openRouterComplete(messages, systemPrompt));
  } else {
    if (hasOpenRouter) providers.push(() => openRouterComplete(messages, systemPrompt));
    if (gemini.isConfigured()) providers.push(gem);
  }
  if (!providers.length) {
    throw new Error(
      "No AI API configured. Please set GEMINI_API_KEY or OPENROUTER_API_KEY"
    );
  }

  let lastError;
  for (const run of providers) {
    try {
      const text = await run();
      if (text) return text;
    } catch (error) {
      lastError = error;
      console.warn("AI provider failed, trying next:", error.message);
    }
  }
  throw lastError || new Error("No response from AI model");
}

/**
 * Streaming variant. Gemini streams token-by-token; if Gemini is unavailable
 * we fall back to a non-streamed OpenRouter answer sent as one chunk.
 * @returns {Promise<string>} the full reply text
 */
export async function streamReply(
  messages,
  onToken,
  signal,
  systemPrompt = SYSTEM_PROMPT,
  chain
) {
  if (wantsGeminiFirst() || !envSet("OPENROUTER_API_KEY")) {
    if (gemini.isConfigured()) {
      try {
        return await gemini.streamText(messages, onToken, {
          systemPrompt,
          signal,
          models: chain,
        });
      } catch (error) {
        if (signal?.aborted || !envSet("OPENROUTER_API_KEY")) throw error;
        console.warn("Gemini stream failed, falling back:", error.message);
      }
    }
  }
  const text = await generateReply(messages, systemPrompt, chain);
  onToken(text);
  return text;
}
