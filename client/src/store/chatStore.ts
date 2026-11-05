import toast from "react-hot-toast";
import { create } from "zustand";
import { chatService } from "@/shared/services/chat.service";
import { getErrorMessage } from "@/shared/utils/error.utils";
import type { Chat, ChatMessage } from "@/shared/types";

interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;

  /** Load the user's chats (de-duplicated). Creates the first chat for a brand-new user. */
  loadChats: () => Promise<void>;
  /** Re-use an existing empty chat instead of piling up "New Chat" rows. */
  createOrReuseEmptyChat: () => Promise<Chat | undefined>;
  selectChat: (chatId: string | null) => void;
  /** Append a finished exchange to a chat and float it to the top (matches server ordering). */
  applyExchange: (chatId: string, newMessages: ChatMessage[], name?: string, replaceLast?: boolean) => void;
  addChat: (chat: Chat) => void;
  renameChat: (chatId: string, name: string) => Promise<void>;
  pinChat: (chatId: string, pinned: boolean) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  setShareId: (chatId: string, shareId: string | undefined) => void;
  reset: () => void;
}

let loadInFlight: Promise<void> | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  selectedChatId: null,

  loadChats: () => {
    // De-duplicate concurrent calls (React StrictMode runs effects twice in dev, which
    // would otherwise create two empty chats for a brand-new user).
    loadInFlight ??= (async () => {
      try {
        const data = await chatService.list();
        if (!data.success) return void toast.error(data.message);

        if (data.chats.length === 0) {
          const created = await chatService.create();
          if (created.success) set({ chats: [created.chat], selectedChatId: created.chat._id });
          return;
        }
        set((state) => ({
          chats: data.chats,
          selectedChatId: data.chats.some((c) => c._id === state.selectedChatId) ? state.selectedChatId : data.chats[0]._id,
        }));
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    })().finally(() => {
      loadInFlight = null;
    });
    return loadInFlight;
  },

  createOrReuseEmptyChat: async () => {
    try {
      const empty = get().chats.find((c) => c.messages.length === 0);
      if (empty) {
        set({ selectedChatId: empty._id });
        return empty;
      }
      const data = await chatService.create();
      if (!data.success) return void toast.error(data.message);
      set((state) => ({ chats: [data.chat, ...state.chats], selectedChatId: data.chat._id }));
      return data.chat;
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  selectChat: (selectedChatId) => set({ selectedChatId }),

  applyExchange: (chatId, newMessages, name, replaceLast = false) =>
    set((state) => {
      const target = state.chats.find((c) => c._id === chatId);
      if (!target) return state;
      // regenerate: the previous user+assistant pair is replaced
      const base = replaceLast ? target.messages.slice(0, -2) : target.messages;
      const updated: Chat = {
        ...target,
        name: name ?? target.name,
        messages: [...base, ...newMessages],
        updatedAt: new Date().toISOString(),
      };
      return { chats: [updated, ...state.chats.filter((c) => c._id !== chatId)] };
    }),

  addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats], selectedChatId: chat._id })),

  renameChat: async (chatId, name) => {
    try {
      const data = await chatService.rename(chatId, name);
      if (!data.success) return void toast.error(data.message);
      set((state) => ({ chats: state.chats.map((c) => (c._id === chatId ? { ...c, name: data.chat.name } : c)) }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  pinChat: async (chatId, pinned) => {
    // optimistic update, rolled back on failure
    const setPinned = (value: boolean) =>
      set((state) => ({ chats: state.chats.map((c) => (c._id === chatId ? { ...c, pinned: value } : c)) }));
    setPinned(pinned);
    try {
      const data = await chatService.pin(chatId, pinned);
      if (!data.success) throw new Error(data.message);
    } catch (error) {
      setPinned(!pinned);
      toast.error(getErrorMessage(error));
    }
  },

  deleteChat: async (chatId) => {
    try {
      const data = await chatService.remove(chatId);
      if (!data.success) return void toast.error(data.message);
      toast.success("Chat deleted");
      await get().loadChats();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  setShareId: (chatId, shareId) =>
    set((state) => ({ chats: state.chats.map((c) => (c._id === chatId ? { ...c, shareId } : c)) })),

  reset: () => set({ chats: [], selectedChatId: null }),
}));

/** The currently selected chat (or null). */
export const useSelectedChat = (): Chat | null =>
  useChatStore((state) => state.chats.find((c) => c._id === state.selectedChatId) ?? null);
