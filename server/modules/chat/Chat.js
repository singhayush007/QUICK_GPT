import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true },
    userName: { type: String, required: true },
    name: { type: String, required: true },
    pinned: { type: Boolean, default: false },
    shareId: { type: String },
    messages: [
      {
        isImage: { type: Boolean, required: true },
        isPublished: { type: Boolean, default: false },
        role: { type: String, required: true },
        content: { type: String, required: true },
        model: { type: String },
        timestamp: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
