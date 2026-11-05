import type { Chat } from "@/shared/types";

export interface ChatGroup {
  label: string;
  items: Chat[];
}

/** Buckets chats into sidebar groups by last update time (pinned chats first). */
export function groupChatsByDate(chats: Chat[]): ChatGroup[] {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const day = 86400000;
  const groups: ChatGroup[] = [
    { label: "Pinned", items: [] },
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];
  for (const chat of chats) {
    const t = new Date(chat.updatedAt).getTime();
    if (chat.pinned) groups[0].items.push(chat);
    else if (t >= startOfToday) groups[1].items.push(chat);
    else if (t >= startOfToday - day) groups[2].items.push(chat);
    else if (t >= startOfToday - 7 * day) groups[3].items.push(chat);
    else groups[4].items.push(chat);
  }
  return groups.filter((g) => g.items.length);
}
