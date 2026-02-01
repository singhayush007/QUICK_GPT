import { OpenAI } from "openai";

/**
 * OpenRouter API Configuration
 * Provides access to multiple AI models through OpenRouter
 * Falls back to Gemini if OpenRouter fails or spending limit is reached
 */
const openRouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_REFERRER || "http://localhost:3000",
    "X-Title": "QuickGPT",
  },
});

export default openRouter;
