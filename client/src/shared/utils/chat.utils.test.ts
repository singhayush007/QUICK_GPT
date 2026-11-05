import { describe, expect, it } from "vitest";
import type { Chat } from "@/shared/types";
import { chatTitle, chatToMarkdown } from "./chat.utils";

const chat = (over: Partial<Chat> = {}): Chat => ({
  _id: "1",
  name: "New Chat",
  updatedAt: "2026-01-01T00:00:00Z",
  messages: [],
  ...over,
});

describe("chatTitle", () => {
  it("prefers an explicit name", () => {
    expect(chatTitle(chat({ name: "Trip plan" }))).toBe("Trip plan");
  });
  it("derives a title from the first message while the name is the default", () => {
    const c = chat({ messages: [{ role: "user", content: "How do I deploy to Vercel?", timestamp: 1 }] });
    expect(chatTitle(c)).toBe("How do I deploy to Vercel?");
  });
  it("falls back to 'New Chat' for an empty chat", () => {
    expect(chatTitle(chat())).toBe("New Chat");
  });
});

describe("chatToMarkdown", () => {
  it("exports a readable transcript including images", () => {
    const md = chatToMarkdown(
      chat({
        name: "Demo",
        messages: [
          { role: "user", content: "hi", timestamp: 1 },
          { role: "assistant", content: "hello!", timestamp: 2 },
          { role: "assistant", content: "http://img/1.png", isImage: true, timestamp: 3 },
        ],
      }),
    );
    expect(md).toContain("# Demo");
    expect(md).toContain("**You**:");
    expect(md).toContain("**QuickGPT**:");
    expect(md).toContain("![generated image](http://img/1.png)");
  });
});
