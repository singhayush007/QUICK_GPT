import type { ChatMessage } from "@/shared/types";
import type { PendingExchange } from "../hooks/UseChatSender";
import type { ComposerMode } from "../types/chat.types";
import Message from "@/shared/components/messages/Message";
import PendingReply from "./PendingReply";

interface MessageListProps {
  messages: ChatMessage[];
  /** The in-flight exchange of THIS chat (optimistic user prompt + streaming answer). */
  pending: PendingExchange | null;
  mode: ComposerMode;
  canRegenerate: boolean;
  onRegenerate: () => void;
}

export default function MessageList({ messages, pending, mode, canRegenerate, onRegenerate }: MessageListProps) {
  return (
    <>
      {messages.map((m, i) => (
        <Message
          key={`${m.timestamp}-${i}`}
          message={m}
          onRegenerate={canRegenerate && i === messages.length - 1 ? onRegenerate : undefined}
        />
      ))}
      {pending && (
        <>
          <Message message={{ role: "user", content: pending.prompt, timestamp: Date.now() }} />
          {pending.text ? (
            <Message streaming message={{ role: "assistant", content: pending.text, timestamp: Date.now() }} />
          ) : (
            <PendingReply mode={mode} />
          )}
        </>
      )}
    </>
  );
}
