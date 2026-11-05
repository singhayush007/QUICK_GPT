import { useMemo, useState } from "react";
import { chatTitle } from "@/shared/utils/chat.utils";
import type { Chat } from "@/shared/types";
import { groupChatsByDate } from "../util/sidebar.utils";

/** Search box state + the filtered, date-grouped chat list. */
export function useChatSearch(chats: Chat[]) {
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? chats.filter((c) => chatTitle(c).toLowerCase().includes(q) || c.messages.some((m) => !m.isImage && m.content.toLowerCase().includes(q)))
      : chats;
    return groupChatsByDate(filtered);
  }, [chats, search]);

  return { search, setSearch, groups };
}
