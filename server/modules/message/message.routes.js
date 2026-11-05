import express from "express";
import { protect } from "../auth/auth.middleware.js";
import { messageLimiter } from "../../shared/middlewares/rateLimiters.js";
import {
  imageMessageController,
  listModels,
  streamMessageController,
  textMessageController,
} from "./message.controller.js";

const messageRouter = express.Router();

// The catalogue is a cheap read fetched on every page load: it must NOT eat the AI quota.
messageRouter.get("/models", protect, listModels);
// Only the calls that hit paid AI providers are rate limited.
messageRouter.post("/text", messageLimiter, protect, textMessageController);
messageRouter.post("/stream", messageLimiter, protect, streamMessageController);
messageRouter.post("/image", messageLimiter, protect, imageMessageController);

export default messageRouter;
