import type { Chat } from "@/shared/types";
import { makeTitle } from "./format.utils";

/** Display title of a chat. */
export function chatTitle(chat: Chat): string {
  if (chat.name && chat.name !== "New Chat") return chat.name;
  const first = chat.messages?.[0]?.content;
  return first ? makeTitle(first) : "New Chat";
}

/** Serialise a chat to Markdown for the "Export" button. */
export function chatToMarkdown(chat: Chat): string {
  const lines = [`# ${chatTitle(chat)}`, ""];
  for (const m of chat.messages) {
    const who = m.role === "user" ? "**You**" : "**QuickGPT**";
    lines.push(`${who}:`, "", m.isImage ? `![generated image](${m.content})` : m.content, "");
  }
  return lines.join("\n");
}

/** Public URL of a shared chat. */
export function shareUrl(shareId: string): string {
  return `${window.location.origin}/share/${shareId}`;
}
