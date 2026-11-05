import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ShareDialog from "@/features/share/components/ShareDialog";
import VoiceMode from "@/features/voice/components/VoiceMode";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useAuthStore } from "@/store/authStore";
import { useSelectedChat } from "@/store/chatStore";
import ChatHeader from "../components/ChatHeader";
import EmptyState from "../components/EmptyState";
import MessageList from "../components/MessageList";
import ScrollToLatestButton from "../components/ScrollToLatestButton";
import Composer from "../components/composer/Composer";
import { IMAGE_COST, type Suggestion } from "../constants/chat.constants";
import { useAutoGrowTextarea } from "../hooks/UseAutoGrowTextarea";
import { useAutoScroll } from "../hooks/UseAutoScroll";
import { useChatPrefill } from "../hooks/UseChatPrefill";
import { useChatSender } from "../hooks/UseChatSender";
import { useActiveModel, useModelsQuery } from "../hooks/UseModelsQuery";
import type { ComposerMode, ImageSize, ModelInfo } from "../types/chat.types";
import { exportChatAsMarkdown } from "../util/chatExport.utils";

/** The chat screen: header, message list, composer, share dialog and voice mode. */
export default function ChatPage({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate();
  const chat = useSelectedChat();
  const isProUser = useAuthStore((s) => s.user?.plan === "pro");
  const personaId = usePreferencesStore((s) => s.personaId);
  const setPersonaId = usePreferencesStore((s) => s.setPersonaId);
  const setModelId = usePreferencesStore((s) => s.setModelId);

  const models = useModelsQuery();
  const model = useActiveModel(models);

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<ComposerMode>("text");
  const [imageSize, setImageSize] = useState<ImageSize>("square");
  const [publishImage, setPublishImage] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const allMessages = chat?.messages ?? [];

  const { scrollRef, showJump, onScroll, jumpToBottom, stickToBottom, pinIfStuck } = useAutoScroll();
  const sender = useChatSender({
    chat,
    model,
    personaId,
    imageSize,
    publishImage,
    onDraftClear: useCallback(() => setPrompt(""), []),
    onDraftRestore: setPrompt,
    onSendStart: stickToBottom,
  });
  const { pending, busy, send, stop, credits } = sender;

  // only show the in-flight exchange in the chat it belongs to
  const visiblePending = pending && pending.chatId === chat?._id ? pending : null;
  // while regenerating, hide the old answer (and its prompt) being replaced
  const messages = visiblePending?.regenerate ? allMessages.slice(0, -2) : allMessages;
  const cost = mode === "image" ? IMAGE_COST : model.cost;
  const lastMessage = allMessages[allMessages.length - 1];
  const canRegenerate = !busy && lastMessage?.role === "assistant" && !lastMessage.isImage;
  const empty = messages.length === 0 && !visiblePending;

  // keep pinned to the bottom while messages / tokens arrive (unless the user scrolled up)
  useEffect(() => {
    pinIfStuck();
  }, [messages.length, visiblePending?.text, chat?._id, pinIfStuck]);

  useAutoGrowTextarea(textareaRef, prompt);
  useChatPrefill(
    useCallback((text: string) => {
      setMode("text");
      setPrompt(text);
      textareaRef.current?.focus();
    }, []),
  );

  const submit = async () => {
    await send(prompt, { mode });
    textareaRef.current?.focus();
  };

  const regenerate = async () => {
    const lastUser = [...allMessages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    await send(lastUser.content, { mode: "text", regenerate: true });
    textareaRef.current?.focus();
  };

  const pickSuggestion = (s: Suggestion) => {
    setMode(s.mode);
    if (s.mode === "image") setPrompt(s.prompt);
    else void send(s.prompt, { mode: s.mode });
  };

  const chooseModel = (m: ModelInfo) => {
    if (m.locked) {
      toast(`The ${m.name} model needs a paid plan — unlock it with any credit plan.`, { icon: "🔒" });
      return navigate("/credits");
    }
    setModelId(m.id);
  };

  return (
    <div className="relative flex h-full min-w-0 flex-1 flex-col">
      <ChatHeader
        chat={chat}
        messageCount={messages.length}
        onMenu={onMenu}
        onShare={() => setShareOpen(true)}
        onExport={() => exportChatAsMarkdown(chat)}
      />

      {voiceModeOpen && (
        <VoiceMode
          modelName={model.name}
          cost={model.cost}
          onSend={(text) => send(text, { mode: "text", voiceTurn: true })}
          onStopRequest={stop}
          onClose={() => setVoiceModeOpen(false)}
        />
      )}
      {shareOpen && chat && <ShareDialog chat={chat} onClose={() => setShareOpen(false)} />}

      {/* messages */}
      <ScrollArea scrollRef={scrollRef} onScroll={onScroll}>
        {empty ? (
          <EmptyState onPick={pickSuggestion} />
        ) : (
          <MessageList messages={messages} pending={visiblePending} mode={mode} canRegenerate={canRegenerate} onRegenerate={() => void regenerate()} />
        )}
      </ScrollArea>

      {showJump && <ScrollToLatestButton onClick={jumpToBottom} />}

      <Composer
        textareaRef={textareaRef}
        prompt={prompt}
        onPromptChange={setPrompt}
        mode={mode}
        onModeChange={setMode}
        imageSize={imageSize}
        onImageSizeChange={setImageSize}
        publishImage={publishImage}
        onPublishImageChange={setPublishImage}
        models={models}
        activeModel={model}
        isProUser={isProUser}
        onChooseModel={chooseModel}
        personaId={personaId}
        onChoosePersona={setPersonaId}
        busy={busy}
        hasChat={Boolean(chat)}
        outOfCredits={credits < cost}
        cost={cost}
        onSubmit={() => void submit()}
        onStop={stop}
        onStartVoice={() => setVoiceModeOpen(true)}
      />
    </div>
  );
}

/** The scrollable message column. */
function ScrollArea({ scrollRef, onScroll, children }: { scrollRef: React.RefObject<HTMLDivElement | null>; onScroll: () => void; children: React.ReactNode }) {
  return (
    <div ref={scrollRef} onScroll={onScroll} className="relative flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pb-6 pt-4 md:px-6">{children}</div>
    </div>
  );
}
