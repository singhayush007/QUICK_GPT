import { describe, expect, it } from "vitest";
import type { Chat } from "@/shared/types";
import { groupChatsByDate } from "./sidebar.utils";

const DAY = 86_400_000;
const chat = (id: string, ageMs: number, pinned = false): Chat => ({
  _id: id,
  name: id,
  pinned,
  messages: [],
  updatedAt: new Date(Date.now() - ageMs).toISOString(),
});

describe("groupChatsByDate", () => {
  it("buckets chats by recency and drops empty groups", () => {
    const groups = groupChatsByDate([chat("now", 1000), chat("yday", DAY + 1000), chat("week", 4 * DAY), chat("old", 30 * DAY)]);
    const labels = groups.map((g) => g.label);
    expect(labels).toEqual(expect.arrayContaining(["Previous 7 days", "Older"]));
    expect(groups.find((g) => g.label === "Older")?.items.map((c) => c._id)).toEqual(["old"]);
    expect(groups.every((g) => g.items.length > 0)).toBe(true);
  });
  it("puts pinned chats first regardless of age", () => {
    const groups = groupChatsByDate([chat("recent", 1000), chat("pinned-old", 60 * DAY, true)]);
    expect(groups[0].label).toBe("Pinned");
    expect(groups[0].items[0]._id).toBe("pinned-old");
  });
  it("returns no groups for no chats", () => {
    expect(groupChatsByDate([])).toEqual([]);
  });
});
