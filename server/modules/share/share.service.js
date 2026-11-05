import crypto from "crypto";
import Chat from "../chat/Chat.js";
import Share from "./Share.js";
import { DEFAULT_CHAT_NAME } from "../chat/chat.constants.js";
import { AppError } from "../../shared/utils/httpErrors.js";
import { CHAT_TITLE_MAX, MAX_SHARED_MESSAGES } from "../../shared/constants/limits.js";
import { FALLBACK_SHARE_TITLE, SHARE_ID_BYTES, SHARE_ID_RE } from "./share.constants.js";

const newShareId = () => crypto.randomBytes(SHARE_ID_BYTES).toString("base64url");

const titleOf = (chat) =>
  chat.name && chat.name !== DEFAULT_CHAT_NAME
    ? chat.name
    : chat.messages[0]?.content?.slice(0, CHAT_TITLE_MAX) || FALLBACK_SHARE_TITLE;

const findSnapshot = (shareId) =>
  SHARE_ID_RE.test(shareId) ? Share.findOne({ shareId }).lean() : null;

/**
 * Creates the public link, or refreshes the snapshot of an existing one
 * (the link itself stays the same).
 * @returns {Promise<string>} the share id
 * @throws {AppError} when the chat is missing, not owned, or empty
 */
export async function createShare(user, chatId) {
  const chat = await Chat.findOne({ _id: chatId, userId: user._id }).catch(() => null);

  if (!chat) throw new AppError("Chat not found");
  if (!chat.messages.length) {
    throw new AppError("Send at least one message before sharing a chat");
  }

  const share = await Share.findOneAndUpdate(
    { chatId: chat._id, userId: String(user._id) },
    {
      $set: {
        title: titleOf(chat),
        // first name only: never expose the email or full name
        authorName: user.name.trim().split(/\s+/)[0],
        messages: chat.messages.slice(-MAX_SHARED_MESSAGES).map((m) => ({
          role: m.role,
          content: m.content,
          isImage: m.isImage,
          timestamp: m.timestamp,
        })),
      },
      $setOnInsert: { shareId: newShareId() },
    },
    { upsert: true, new: true }
  );

  await Chat.updateOne(
    { _id: chat._id },
    { shareId: share.shareId },
    { timestamps: false }
  );

  return share.shareId;
}

/** Deletes the public snapshot of a chat (used by revoke + chat deletion). */
export const revokeShareFor = (chatId, userId) =>
  Share.deleteOne({ chatId, userId: String(userId) });

/** Revokes the public link immediately and clears the chat's `shareId`. */
export async function removeShare(userId, chatId) {
  await revokeShareFor(chatId, userId);
  await Chat.updateOne(
    { _id: chatId, userId },
    { $unset: { shareId: 1 } },
    { timestamps: false }
  );
}

/**
 * Public view of a snapshot (no email / user id). Null when unknown.
 * @param {string} shareId
 */
export async function getPublicShare(shareId) {
  const share = await findSnapshot(shareId);
  if (!share) return null;
  return {
    title: share.title,
    authorName: share.authorName,
    sharedAt: share.updatedAt,
    messages: share.messages,
  };
}

/** Copies a shared chat into the caller's own chats. */
export async function importSharedChat(user, shareId) {
  const share = await findSnapshot(shareId);
  if (!share) throw new AppError("Link not found");

  return Chat.create({
    userId: user._id,
    userName: user.name,
    name: share.title,
    messages: share.messages,
  });
}
