import express from "express";
import {
  createChat,
  deleteChat,
  getChats,
  pinChat,
  renameChat,
} from "./chat.controller.js";
import { protect } from "../auth/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.get("/create", protect, createChat);
chatRouter.get("/get", protect, getChats);
chatRouter.post("/rename", protect, renameChat);
chatRouter.post("/pin", protect, pinChat);
chatRouter.post("/delete", protect, deleteChat);

export default chatRouter;
