import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage, isAbortError } from "@/shared/utils/error.utils";
import { makeTitle } from "@/shared/utils/format.utils";
import type { Chat, ChatMessage } from "@/shared/types";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { IMAGE_COST, MAX_PROMPT_LENGTH } from "../constants/chat.constants";
import { messageService } from "../services/message.service";
import type { ComposerMode, ImageSize, ModelInfo, SendOptions, StreamEvent } from "../types/chat.types";
import { readSSE } from "../util/sse.utils";

/** An exchange that is still in flight (shown optimistically). */
export interface PendingExchange {
  chatId: string;
  prompt: string;
  /** Tokens received so far. */
  text: string;
  regenerate: boolean;
}

interface Params {
  chat: Chat | null;
  model: Pick<ModelInfo, "id" | "cost">;
  personaId: string;
  imageSize: ImageSize;
  publishImage: boolean;
  /** Typed sends clear the composer; failures give the text back (only in the same chat). */
  onDraftClear: () => void;
  onDraftRestore: (text: string) => void;
  /** Called when a send starts so the list can re-attach to the bottom. */
  onSendStart: () => void;
}

/**
 * Sends one turn (text via SSE streaming, or an image) and keeps the optimistic
 * "pending" state. `send` resolves with the assistant's text (null on failure)
 * so voice mode can read it aloud.
 */
export function useChatSender({ chat, model, personaId, imageSize, publishImage, onDraftClear, onDraftRestore, onSendStart }: Params) {
  const credits = useAuthStore((s) => s.user?.credits ?? 0);
  const patchUser = useAuthStore((s) => s.patchUser);
  const applyExchange = useChatStore((s) => s.applyExchange);

  const [pending, setPending] = useState<PendingExchange | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const chatId = chat?._id;
  const chatIdRef = useRef(chatId);
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  // Cancel any in-flight request when switching chats / leaving the page
  useEffect(() => () => abortRef.current?.abort(), [chatId]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string, { mode, regenerate = false, voiceTurn = false }: SendOptions): Promise<string | null> => {
      const content = text.trim();
      if (!content || pending || !chat) return null;
      if (content.length > MAX_PROMPT_LENGTH) {
        toast.error(`Max ${MAX_PROMPT_LENGTH} characters`);
        return null;
      }

      const cost = mode === "image" ? IMAGE_COST : model.cost;
      if (credits < cost) {
        toast.error(`Not enough credits — this needs ${cost}. Top up to keep going.`);
        return null;
      }

      const id = chat._id;
      const isFirst = !regenerate && chat.messages.length === 0 && chat.name === "New Chat";
      const autoName = isFirst ? makeTitle(content) : undefined;
      const userMsg: ChatMessage = { role: "user", content, timestamp: Date.now(), isImage: false };

      if (!voiceTurn) onDraftClear(); // a spoken turn must not wipe a typed draft
      onSendStart();
      setPending({ chatId: id, prompt: content, text: "", regenerate });
      let replyText: string | null = null;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        if (mode === "image") {
          const data = await messageService.image({ chatId: id, prompt: content, isPublished: publishImage, size: imageSize }, controller.signal);
          if (!data.success) throw new Error(data.message);
          applyExchange(id, [userMsg, data.reply], autoName);
          patchUser({ credits: data.credits });
          replyText = data.reply.content;
        } else {
          const response = await messageService.openStream(
            { chatId: id, prompt: content, persona: personaId, regenerate, model: model.id, voice: voiceTurn },
            controller.signal,
          );
          if (!response.ok) {
            const body = (await response.json().catch(() => ({}))) as { message?: string };
            throw new Error(body.message || `Request failed (${response.status})`);
          }

          let finished = false;
          await readSSE<StreamEvent>(response, (event) => {
            if (event.type === "token") {
              setPending((p) => (p ? { ...p, text: p.text + event.text } : p));
            } else if (event.type === "done") {
              finished = true;
              replyText = event.reply.content;
              applyExchange(id, [userMsg, event.reply], autoName, regenerate);
              patchUser({ credits: event.credits });
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          });
          if (!finished) throw new Error("Connection lost before the reply finished");
        }
      } catch (error) {
        const sameChat = chatIdRef.current === id;
        if (!isAbortError(error)) toast.error(getErrorMessage(error));
        else if (!sameChat) toast("Reply cancelled because you switched chats — no credit was used.", { icon: "↩️" });
        // give the text back to the composer — only in the chat it was written for
        if (!regenerate && !voiceTurn && sameChat) onDraftRestore(content);
        replyText = null;
      } finally {
        setPending(null);
        abortRef.current = null;
      }
      return replyText;
    },
    [pending, chat, model, credits, personaId, imageSize, publishImage, applyExchange, patchUser, onDraftClear, onDraftRestore, onSendStart],
  );

  return { pending, busy: Boolean(pending), send, stop, credits };
}

export type { ComposerMode };
