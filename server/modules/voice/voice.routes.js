import express from "express";
import { protect } from "../auth/auth.middleware.js";
import { voiceLimiter } from "../../shared/middlewares/rateLimiters.js";
import { listVoices, speak } from "./voice.controller.js";

const voiceRouter = express.Router();

voiceRouter.get("/list", protect, listVoices);
voiceRouter.post("/speak", voiceLimiter, protect, speak);

export default voiceRouter;
