import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./modules/auth/auth.routes.js";
import chatRouter from "./modules/chat/chat.routes.js";
import messageRouter from "./modules/message/message.routes.js";
import creditRouter from "./modules/credits/credits.routes.js";
import shareRouter from "./modules/share/share.routes.js";
import liveRouter from "./modules/live/live.routes.js";
import voiceRouter from "./modules/voice/voice.routes.js";
import communityRouter from "./modules/community/community.routes.js";
import { razorpayWebhooks } from "./modules/credits/webhook.controller.js";
import { errorHandler } from "./shared/middlewares/errorHandler.js";
import { notFound } from "./shared/middlewares/notFound.js";
import { JSON_BODY_LIMIT } from "./shared/constants/limits.js";
import { envSet } from "./config/env.js";

/**
 * Builds the Express app (no DB connection, no listen) so it can be
 * imported by server.js, Vercel and tests alike.
 * @returns {import("express").Express}
 */
export function createApp() {
  const app = express();

  // Needed so rate limiting sees the real client IP behind Vercel / proxies
  app.set("trust proxy", 1);
  app.use(helmet());

  // Razorpay webhook needs the RAW body for signature verification,
  // so it must be registered before express.json().
  app.post(
    "/api/razorpay",
    express.raw({ type: "application/json" }),
    razorpayWebhooks
  );

  // CORS_ORIGIN can be a comma separated allow-list; defaults to "allow all"
  const origins = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim());
  app.use(cors(origins?.length ? { origin: origins } : undefined));
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  // Routes
  app.get("/", (req, res) => res.send("Server is Live!"));
  app.get("/api/health", (req, res) =>
    res.json({
      success: true,
      status: "ok",
      uptime: process.uptime(),
      features: {
        gemini: envSet("GEMINI_API_KEY"),
        openRouter: envSet("OPENROUTER_API_KEY"),
        images: envSet("IMAGEKIT_PRIVATE_KEY"),
        payments: envSet("RAZORPAY_KEY_SECRET"),
      },
    })
  );
  // The gallery keeps its historical path under /api/user, but it is its own module.
  app.use("/api/user/published-images", communityRouter);
  app.use("/api/user", authRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/message", messageRouter);
  app.use("/api/credit", creditRouter);
  app.use("/api/share", shareRouter);
  app.use("/api/live", liveRouter);
  app.use("/api/voice", voiceRouter);

  // 404 + central error handler (malformed JSON, etc.)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
