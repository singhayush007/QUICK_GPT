import axios from "axios";
import User from "../auth/User.js";
import { findUserChat } from "../chat/chat.service.js";
import { DEFAULT_CHAT_NAME } from "../chat/chat.constants.js";
import { enrichWithRealTimeData } from "../live/live.service.js";
import { getImageKit, isImageKitConfigured } from "../../config/imagekit.client.js";
import { AppError, badRequest, forbidden, notFound, serviceUnavailable } from "../../shared/utils/httpErrors.js";
import { CHAT_TITLE_MAX, IMAGE_CREDIT_COST, MAX_PROMPT_LENGTH } from "../../shared/constants/limits.js";
import { buildHistory, generateReply, streamReply, systemPromptFor } from "./ai.service.js";
import { canUseModel, getModel, modelsForUser } from "./models.constants.js";
import {
  DEFAULT_IMAGE_SIZE,
  IMAGE_FETCH_TIMEOUT_MS,
  IMAGE_SIZES,
  IMAGE_UPLOAD_FOLDER,
} from "./image.constants.js";

/**
 * @typedef {object} MessageInput request values the controllers pass through
 * @property {string} chatId
 * @property {string} [prompt]
 * @property {boolean} [regenerate] re-use the last user prompt, drop the last answer
 * @property {string} [model] model id (lite | flash | pro)
 * @property {string} [persona]
 * @property {boolean} [voice] reply will be read aloud
 * @property {boolean} [isPublished] (image) show in the community gallery
 * @property {string} [size] (image) square | landscape | portrait
 */

/** Catalogue with per-user lock state. */
export const listModels = (user) => modelsForUser(user);

/**
 * Resolves the model the client asked for and enforces the free / Pro split.
 * @throws {AppError} 403 UPGRADE_REQUIRED when the user may not use it
 */
export function pickModel(user, modelId) {
  const model = getModel(modelId);
  if (!canUseModel(user, model)) {
    throw forbidden(
      `The ${model.name} model is for paid users. Buy any credit plan to unlock it.`,
      "UPGRADE_REQUIRED"
    );
  }
  return model;
}

/**
 * Atomically take credits. The `credits >= cost` filter makes this safe
 * against parallel requests (the old read-then-decrement could go negative).
 * Returns the updated user, or null when the balance is too low.
 */
const reserveCredits = (userId, cost) =>
  User.findOneAndUpdate(
    { _id: userId, credits: { $gte: cost } },
    { $inc: { credits: -cost } },
    { new: true }
  );

const refundCredits = (userId, cost) =>
  User.updateOne({ _id: userId }, { $inc: { credits: cost } });

/** Reserves credits or throws the standard "not enough credits" error. */
async function reserveOrFail(userId, cost, messageCost = cost) {
  const user = await reserveCredits(userId, cost);
  if (!user) {
    throw badRequest(
      `Not enough credits — this needs ${messageCost} credit${messageCost > 1 ? "s" : ""}.`
    );
  }
  return user;
}

const validatePrompt = (prompt) => {
  if (typeof prompt !== "string" || !prompt.trim()) return "Prompt is required";
  if (prompt.length > MAX_PROMPT_LENGTH)
    return `Prompt is too long (max ${MAX_PROMPT_LENGTH} characters)`;
  return null;
};

/**
 * Short chat title from the first prompt: cut at a word boundary, drop dangling
 * punctuation and add "…". Keep in sync with makeTitle() in client/src/lib/utils.js.
 */
export const makeTitle = (text, max = CHAT_TITLE_MAX) => {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  let cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > max / 2) cut = cut.slice(0, lastSpace);
  return `${cut.replace(/[\s,;:.\-–—]+$/, "")}…`;
};

/** Give a fresh chat a readable title from its first prompt. */
const autoTitle = (chat, prompt) => {
  if (chat.name === DEFAULT_CHAT_NAME && chat.messages.length === 0) {
    chat.name = makeTitle(prompt);
  }
};

/**
 * Loads the user's chat and validates the prompt.
 * With `regenerate: true` the last user prompt is re-used and the previous
 * assistant answer is dropped (the chat is only saved after a new answer).
 * @throws {AppError} 404 chat not found, 400 nothing to regenerate / bad prompt
 */
async function loadChat(userId, { chatId, regenerate, prompt }) {
  const chat = await findUserChat(userId, chatId);
  if (!chat) throw notFound("Chat not found");

  if (regenerate) {
    const idx = chat.messages.findLastIndex(
      (m) => m.role === "user" && !m.isImage
    );
    if (idx === -1) throw badRequest("Nothing to regenerate");
    prompt = chat.messages[idx].content;
    chat.messages = chat.messages.slice(0, idx);
  }

  const problem = validatePrompt(prompt);
  if (problem) throw badRequest(problem);
  return { chat, prompt };
}

/** Persist the user prompt + assistant reply on the chat. */
async function saveExchange(chat, prompt, reply) {
  autoTitle(chat, prompt);
  chat.messages.push({
    role: "user",
    content: prompt,
    timestamp: Date.now(),
    isImage: false,
  });
  chat.messages.push(reply);
  await chat.save();
}

const textReply = (model, content) => ({
  role: "assistant",
  model: model.id,
  content,
  timestamp: Date.now(),
  isImage: false,
});

/** History + the prompt enriched with live weather / scores / markets when needed. */
async function buildMessages(chat, prompt) {
  const history = buildHistory(chat);
  history.push({ role: "user", content: await enrichWithRealTimeData(prompt) });
  return history;
}

/**
 * Text answer in one piece. Credits are reserved first and refunded on any failure.
 * @param {object} user authenticated user document
 * @param {MessageInput} input
 * @returns {Promise<{reply: object, credits: number}>}
 */
export async function createTextReply(user, input) {
  const userId = user._id;
  const model = pickModel(user, input.model);
  let reserved = false;
  try {
    const { chat, prompt } = await loadChat(userId, input);

    const updated = await reserveOrFail(userId, model.cost);
    reserved = true;

    const history = await buildMessages(chat, prompt);
    const content = await generateReply(history, systemPromptFor(input.persona, input.voice === true), model.chain);
    const reply = textReply(model, content);
    await saveExchange(chat, prompt, reply);

    return { reply, credits: updated.credits };
  } catch (error) {
    if (reserved) await refundCredits(userId, model.cost);
    throw error;
  }
}

/**
 * Streaming text answer. The controller owns the SSE socket and passes callbacks:
 *  - `onStart()` is called once, right before the first token (write the headers there)
 *  - `onToken(text)` for every chunk
 * Resolves with null when the client aborted (credits are refunded, nothing is saved).
 * @param {object} user
 * @param {MessageInput} input
 * @param {{signal: AbortSignal, onStart: () => void, onToken: (text: string) => void}} hooks
 * @returns {Promise<{reply: object, credits: number} | null>}
 */
export async function createStreamReply(user, input, { signal, onStart, onToken }) {
  const userId = user._id;
  const model = pickModel(user, input.model);
  let reserved = false;
  try {
    const { chat, prompt } = await loadChat(userId, input);

    const updated = await reserveOrFail(userId, model.cost);
    reserved = true;

    const history = await buildMessages(chat, prompt);

    if (signal.aborted) {
      reserved = false;
      await refundCredits(userId, model.cost);
      return null;
    }

    onStart();

    let full = "";
    try {
      full = await streamReply(
        history,
        onToken,
        signal,
        systemPromptFor(input.persona, input.voice === true),
        model.chain
      );
    } catch (error) {
      if (signal.aborted) {
        // user stopped: keep nothing, give the credit back
        reserved = false;
        await refundCredits(userId, model.cost);
        return null;
      }
      throw error;
    }

    const reply = textReply(model, full);
    await saveExchange(chat, prompt, reply);
    return { reply, credits: updated.credits };
  } catch (error) {
    if (reserved) await refundCredits(userId, model.cost);
    throw error;
  }
}

/** @throws {AppError} 503 when ImageKit keys are missing / placeholders */
export function assertImagesConfigured() {
  if (!isImageKitConfigured()) {
    throw serviceUnavailable("Image generation is not configured on this server.");
  }
}

/** Generate an image through ImageKit AI and re-upload it to the media library. */
async function generateAndUploadImage(prompt, size = DEFAULT_IMAGE_SIZE) {
  const encodedPrompt = encodeURIComponent(prompt);
  const timestamp = Date.now();
  const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/${IMAGE_UPLOAD_FOLDER}/${timestamp}.png?tr=${IMAGE_SIZES[size] || IMAGE_SIZES[DEFAULT_IMAGE_SIZE]}`;

  const imageResponse = await axios.get(generatedImageUrl, {
    responseType: "arraybuffer",
    timeout: IMAGE_FETCH_TIMEOUT_MS,
  });
  const base64Image = `data:image/png;base64,${Buffer.from(
    imageResponse.data,
    "binary"
  ).toString("base64")}`;

  const uploadResponse = await getImageKit().upload({
    file: base64Image,
    fileName: `${timestamp}.png`,
    folder: IMAGE_UPLOAD_FOLDER,
  });
  if (!uploadResponse?.url) {
    throw new Error("Failed to upload image to ImageKit");
  }
  return uploadResponse.url;
}

/**
 * Image answer (costs IMAGE_CREDIT_COST credits, refunded on failure).
 * @param {object} user
 * @param {MessageInput} input
 * @returns {Promise<{reply: object, credits: number}>}
 */
export async function createImageReply(user, input) {
  const userId = user._id;
  let reserved = false;
  try {
    assertImagesConfigured();
    const { chat, prompt } = await loadChat(userId, input);

    // NOTE: the error text has always said "1 credit" for images (kept as is).
    const updated = await reserveOrFail(userId, IMAGE_CREDIT_COST, 1);
    reserved = true;

    const imageUrl = await generateAndUploadImage(prompt, input.size);
    const reply = {
      role: "assistant",
      content: imageUrl,
      timestamp: Date.now(),
      isImage: true,
      isPublished: Boolean(input.isPublished),
    };
    await saveExchange(chat, prompt, reply);

    return { reply, credits: updated.credits };
  } catch (error) {
    if (reserved) await refundCredits(userId, IMAGE_CREDIT_COST);
    throw error;
  }
}
