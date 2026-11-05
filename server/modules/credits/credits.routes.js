import express from "express";
import {
  getHistory,
  getPlans,
  purchasePlan,
  verifyPayment,
} from "./credits.controller.js";
import { protect } from "../auth/auth.middleware.js";

const creditRouter = express.Router();

creditRouter.get("/plan", getPlans);
creditRouter.get("/history", protect, getHistory);
creditRouter.post("/purchase", protect, purchasePlan);
creditRouter.post("/verify", protect, verifyPayment);

export default creditRouter;
