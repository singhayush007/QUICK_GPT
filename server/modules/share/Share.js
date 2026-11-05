import mongoose from "mongoose";

/**
 * A public, read-only SNAPSHOT of a chat. Kept in its own collection so that
 * - later messages in the original chat never leak through an old link
 * - revoking = deleting this document
 * - no email / user id is ever stored in what the public endpoint returns
 */
const ShareSchema = new mongoose.Schema(
  {
    shareId: { type: String, required: true, unique: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: String, required: true },
    title: { type: String, required: true },
    authorName: { type: String, required: true },
    messages: [
      {
        _id: false,
        role: String,
        content: String,
        isImage: Boolean,
        timestamp: Number,
      },
    ],
  },
  { timestamps: true }
);

ShareSchema.index({ chatId: 1, userId: 1 }, { unique: true });

/** Mongoose model `Share` (collection name must not change). */
export const Share = mongoose.model("Share", ShareSchema);

export default Share;
