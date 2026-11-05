import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Chat } from "@/shared/types";

vi.mock("@/shared/services/chat.service", () => ({
  chatService: { list: vi.fn(), create: vi.fn(), rename: vi.fn(), pin: vi.fn(), remove: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({ default: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }) }));

import { chatService } from "@/shared/services/chat.service";
import { useChatStore } from "./chatStore";

const msg = (role: "user" | "assistant", content: string) => ({ role, content, timestamp: 1 });
const mk = (id: string, messages = [] as Chat["messages"], over: Partial<Chat> = {}): Chat => ({
  _id: id,
  name: id,
  updatedAt: "2026-01-01T00:00:00Z",
  messages,
  ...over,
});

beforeEach(() => {
  useChatStore.setState({ chats: [], selectedChatId: null });
  vi.clearAllMocks();
});

describe("chatStore.applyExchange", () => {
  it("appends the exchange and floats the chat to the top", () => {
    useChatStore.setState({ chats: [mk("a"), mk("b")] });
    useChatStore.getState().applyExchange("b", [msg("user", "hi"), msg("assistant", "yo")], "Hi chat");
    const { chats } = useChatStore.getState();
    expect(chats.map((c) => c._id)).toEqual(["b", "a"]);
    expect(chats[0].messages).toHaveLength(2);
    expect(chats[0].name).toBe("Hi chat");
  });
  it("replaceLast swaps the previous user+assistant pair (regenerate)", () => {
    useChatStore.setState({ chats: [mk("a", [msg("user", "q"), msg("assistant", "old")])] });
    useChatStore.getState().applyExchange("a", [msg("user", "q"), msg("assistant", "new")], undefined, true);
    expect(useChatStore.getState().chats[0].messages.map((m) => m.content)).toEqual(["q", "new"]);
  });
  it("ignores unknown chats", () => {
    useChatStore.setState({ chats: [mk("a")] });
    useChatStore.getState().applyExchange("zzz", [msg("user", "x")]);
    expect(useChatStore.getState().chats).toHaveLength(1);
  });
});

describe("chatStore.createOrReuseEmptyChat", () => {
  it("re-uses an existing empty chat instead of creating another", async () => {
    useChatStore.setState({ chats: [mk("full", [msg("user", "x")]), mk("empty")] });
    const chat = await useChatStore.getState().createOrReuseEmptyChat();
    expect(chat?._id).toBe("empty");
    expect(useChatStore.getState().selectedChatId).toBe("empty");
    expect(chatService.create).not.toHaveBeenCalled();
  });
  it("creates a chat when none is empty", async () => {
    useChatStore.setState({ chats: [mk("full", [msg("user", "x")])] });
    vi.mocked(chatService.create).mockResolvedValue({ success: true, chat: mk("fresh") });
    const chat = await useChatStore.getState().createOrReuseEmptyChat();
    expect(chat?._id).toBe("fresh");
    expect(useChatStore.getState().chats[0]._id).toBe("fresh");
  });
});

describe("chatStore.pinChat", () => {
  it("is optimistic and rolls back when the server refuses", async () => {
    useChatStore.setState({ chats: [mk("a")] });
    vi.mocked(chatService.pin).mockRejectedValue(new Error("boom"));
    await useChatStore.getState().pinChat("a", true);
    expect(useChatStore.getState().chats[0].pinned).toBe(false);
  });
  it("keeps the pin when the server agrees", async () => {
    useChatStore.setState({ chats: [mk("a")] });
    vi.mocked(chatService.pin).mockResolvedValue({ success: true, chat: mk("a", [], { pinned: true }) });
    await useChatStore.getState().pinChat("a", true);
    expect(useChatStore.getState().chats[0].pinned).toBe(true);
  });
});

describe("chatStore.loadChats", () => {
  it("de-duplicates concurrent loads and creates the first chat for a new user", async () => {
    vi.mocked(chatService.list).mockResolvedValue({ success: true, chats: [] });
    vi.mocked(chatService.create).mockResolvedValue({ success: true, chat: mk("first") });
    await Promise.all([useChatStore.getState().loadChats(), useChatStore.getState().loadChats()]);
    expect(chatService.list).toHaveBeenCalledTimes(1);
    expect(chatService.create).toHaveBeenCalledTimes(1);
    expect(useChatStore.getState().selectedChatId).toBe("first");
  });
  it("keeps the current selection when it still exists", async () => {
    useChatStore.setState({ selectedChatId: "b" });
    vi.mocked(chatService.list).mockResolvedValue({ success: true, chats: [mk("a"), mk("b")] });
    await useChatStore.getState().loadChats();
    expect(useChatStore.getState().selectedChatId).toBe("b");
  });
});
