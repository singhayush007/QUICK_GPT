import toast from "react-hot-toast";
import { chatTitle, chatToMarkdown } from "@/shared/utils/chat.utils";
import { downloadText } from "@/shared/utils/download.utils";
import type { Chat } from "@/shared/types";

/** Download the chat as a Markdown file (toast when there is nothing to export). */
export function exportChatAsMarkdown(chat: Chat | null): void {
  if (!chat?.messages.length) return void toast("Nothing to export yet");
  downloadText(`${chatTitle(chat).replace(/[^\w-]+/g, "_")}.md`, chatToMarkdown(chat));
}
