import rateLimit from "express-rate-limit";
import { RATE_LIMITS } from "../constants/limits.js";

const make = ({ windowMs, limit }, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

/** Brute-force protection for login / register. */
export const authLimiter = make(
  RATE_LIMITS.auth,
  "Too many attempts, please try again in a few minutes."
);

/** Protects the paid AI providers from abuse. */
export const messageLimiter = make(
  RATE_LIMITS.message,
  "Too many requests, slow down a bit."
);

/** The public share endpoint is unauthenticated, so throttle scraping / guessing. */
export const publicShareLimiter = make(
  RATE_LIMITS.publicShare,
  "Too many requests, slow down."
);

/** The Live page polls scores, so allow a generous but bounded rate. */
export const liveLimiter = make(RATE_LIMITS.live, "Too many requests, slow down.");

/** Text-to-speech calls are billed by the provider. */
export const voiceLimiter = make(
  RATE_LIMITS.voice,
  "Too many voice requests, slow down."
);
