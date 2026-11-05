import express from "express";
import { protect } from "../auth/auth.middleware.js";
import { publicShareLimiter } from "../../shared/middlewares/rateLimiters.js";
import {
  createShare,
  getSharedChat,
  importSharedChat,
  removeShare,
} from "./share.controller.js";

const shareRouter = express.Router();

shareRouter.post("/create", protect, createShare);
shareRouter.post("/remove", protect, removeShare);
shareRouter.post("/import", protect, importSharedChat);
shareRouter.get("/:shareId", publicShareLimiter, getSharedChat);

export default shareRouter;
