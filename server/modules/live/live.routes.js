import express from "express";
import { protect } from "../auth/auth.middleware.js";
import { liveLimiter } from "../../shared/middlewares/rateLimiters.js";
import { liveAqi, liveMarkets, liveScores, liveWeather } from "./live.controller.js";

const liveRouter = express.Router();

// the Live page polls scores, so allow a generous but bounded rate
liveRouter.use(liveLimiter);

liveRouter.get("/weather", protect, liveWeather);
liveRouter.get("/aqi", protect, liveAqi);
liveRouter.get("/markets", protect, liveMarkets);
liveRouter.get("/scores", protect, liveScores);

export default liveRouter;
