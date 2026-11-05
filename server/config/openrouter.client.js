import { OpenAI } from "openai";

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const DEFAULT_OPENROUTER_MODEL = "meta-llama/llama-3.2-3b-instruct:free";
const DEFAULT_REFERRER = "http://localhost:3000";

let client = null;

/**
 * OpenRouter client (OpenAI-compatible). Created lazily so a missing key
 * never breaks server start-up.
 */
export const getOpenRouter = () => {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": process.env.OPENROUTER_REFERRER || DEFAULT_REFERRER,
        "X-Title": "QuickGPT",
      },
    });
  }
  return client;
};

export default getOpenRouter;
