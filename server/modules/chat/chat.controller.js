import * as chatService from "./chat.service.js";

// Invalid ids (CastError) are just "not found" — never leak Mongoose internals
const fail = (res, error) =>
  res.json({
    success: false,
    message: error.name === "CastError" ? "Chat not found" : error.message,
  });

// API Controller for creating a new chat
export const createChat = async (req, res) => {
  try {
    const chat = await chatService.createChat(req.user);
    res.json({ success: true, message: "Chat created", chat });
  } catch (error) {
    fail(res, error);
  }
};

// API Controller for getting all chats
export const getChats = async (req, res) => {
  try {
    const chats = await chatService.listChats(req.user._id);
    res.json({ success: true, chats });
  } catch (error) {
    fail(res, error);
  }
};

// API Controller for renaming a chat
export const renameChat = async (req, res) => {
  try {
    const { chatId, name } = req.body;
    const chat = await chatService.renameChat(req.user._id, chatId, name);
    res.json({ success: true, message: "Chat renamed", chat });
  } catch (error) {
    fail(res, error);
  }
};

// API Controller for pinning / unpinning a chat
export const pinChat = async (req, res) => {
  try {
    const { chatId, pinned } = req.body;
    const chat = await chatService.pinChat(req.user._id, chatId, pinned);
    res.json({ success: true, chat });
  } catch (error) {
    fail(res, error);
  }
};

// API Controller for deleting a chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    await chatService.deleteChat(req.user._id, chatId);
    res.json({ success: true, message: "Chat Deleted" });
  } catch (error) {
    fail(res, error);
  }
};
