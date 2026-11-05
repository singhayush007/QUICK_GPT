import Chat from "./Chat.js";
import { DEFAULT_CHAT_NAME } from "./chat.constants.js";
import { revokeShareFor } from "../share/share.service.js";
import { notFound, badRequest } from "../../shared/utils/httpErrors.js";
import { MAX_CHAT_NAME_LENGTH } from "../../shared/constants/limits.js";


/**
 * Finds a chat owned by the user. Invalid ids (CastError) are just "not found".
 * @returns {Promise<import("mongoose").HydratedDocument<any> | null>}
 */
export const findUserChat = (userId, chatId) =>
  Chat.findOne({ userId, _id: chatId }).catch(() => null);

/** Creates an empty chat for the user. */
export const createChat = (user) =>
  Chat.create({
    userId: user._id,
    messages: [],
    name: DEFAULT_CHAT_NAME,
    userName: user.name,
  });

/** All chats of a user, most recently updated first. */
export const listChats = (userId) =>
  Chat.find({ userId }).sort({ updatedAt: -1 });

/** Renames a chat (trimmed, max 60 chars). Throws AppError when empty / not found. */
export async function renameChat(userId, chatId, name) {
  const trimmed =
    typeof name === "string" ? name.trim().slice(0, MAX_CHAT_NAME_LENGTH) : "";
  if (!trimmed) throw badRequest("Name cannot be empty");
  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId },
    { name: trimmed },
    { new: true }
  );
  if (!chat) throw notFound("Chat not found");
  return chat;
}

/** Pins / unpins a chat without bumping its `updatedAt`. */
export async function pinChat(userId, chatId, pinned) {
  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId },
    { pinned: Boolean(pinned) },
    { new: true, timestamps: false }
  );
  if (!chat) throw notFound("Chat not found");
  return chat;
}

/** Deletes a chat and revokes its public share link. */
export async function deleteChat(userId, chatId) {
  const { deletedCount } = await Chat.deleteOne({ _id: chatId, userId });
  if (!deletedCount) throw notFound("Chat not found");
  // a deleted chat must not stay publicly reachable
  await revokeShareFor(chatId, userId);
}
