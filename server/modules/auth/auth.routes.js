import express from "express";
import { getUser, loginUser, registerUser } from "./auth.controller.js";
import { protect } from "./auth.middleware.js";
import { authLimiter } from "../../shared/middlewares/rateLimiters.js";

const authRouter = express.Router();

authRouter.post("/register", authLimiter, registerUser);
authRouter.post("/login", authLimiter, loginUser);
authRouter.get("/data", protect, getUser);

export default authRouter;
