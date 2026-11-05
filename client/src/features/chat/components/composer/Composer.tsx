import { useState, type KeyboardEvent, type RefObject } from "react";
import { Link } from "react-router-dom";
import { MAX_PROMPT_LENGTH } from "../../constants/chat.constants";
import type { ComposerMode, ImageSize, ModelInfo } from "../../types/chat.types";
import ComposerActions from "./ComposerActions";
import ImageOptions from "./ImageOptions";
import ModeToggle from "./ModeToggle";
import ModelPicker from "./ModelPicker";
import PersonaPicker from "./PersonaPicker";

interface ComposerProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  prompt: string;
  onPromptChange: (value: string) => void;
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  imageSize: ImageSize;
  onImageSizeChange: (size: ImageSize) => void;
  publishImage: boolean;
  onPublishImageChange: (publish: boolean) => void;
  models: ModelInfo[];
  activeModel: Pick<ModelInfo, "id" | "name" | "tier">;
  isProUser: boolean;
  onChooseModel: (model: ModelInfo) => void;
  personaId: string;
  onChoosePersona: (id: string) => void;
  busy: boolean;
  hasChat: boolean;
  /** True when the balance can't cover the next message. */
  outOfCredits: boolean;
  cost: number;
  onSubmit: () => void;
  onStop: () => void;
  onStartVoice: () => void;
}

type OpenPicker = "model" | "persona" | null;

/** Input box + toolbar (mode, model, persona, image options) + send/stop/voice actions. */
export default function Composer(props: ComposerProps) {
  const { textareaRef, prompt, onPromptChange, mode, busy, hasChat, outOfCredits, cost, onSubmit } = props;
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSubmit();
    }
  };

  const togglePicker = (which: Exclude<OpenPicker, null>) => setOpenPicker((cur) => (cur === which ? null : which));

  return (
    <div className="px-4 pb-4 pt-2 md:px-6">
      <div className="mx-auto max-w-3xl">
        {outOfCredits && (
          <Link
            to="/credits"
            className="mb-2 block rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-600 hover:bg-amber-500/15 dark:text-amber-400"
          >
            You're out of credits — <span className="font-semibold underline">get more</span>
          </Link>
        )}
        <div className="rounded-3xl border border-line bg-surface p-2 shadow-xl shadow-black/5 transition focus-within:border-brand/60 focus-within:shadow-brand/10">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={MAX_PROMPT_LENGTH}
            disabled={!hasChat}
            placeholder={mode === "image" ? "Describe the image you want to create…" : "Message QuickGPT…"}
            className="max-h-[200px] w-full resize-none bg-transparent px-3 py-2 text-[0.95rem] outline-none placeholder:text-muted"
          />
          <div className="flex items-center justify-between gap-2 px-1 pt-1">
            <div className="flex items-center gap-2">
              <ModeToggle mode={mode} onChange={props.onModeChange} />
              {mode === "text" ? (
                <>
                  <ModelPicker
                    models={props.models}
                    active={props.activeModel}
                    isProUser={props.isProUser}
                    open={openPicker === "model"}
                    onToggle={() => togglePicker("model")}
                    onClose={() => setOpenPicker(null)}
                    onChoose={(m) => {
                      setOpenPicker(null);
                      props.onChooseModel(m);
                    }}
                  />
                  <PersonaPicker
                    personaId={props.personaId}
                    open={openPicker === "persona"}
                    onToggle={() => togglePicker("persona")}
                    onClose={() => setOpenPicker(null)}
                    onChoose={(id) => {
                      setOpenPicker(null);
                      props.onChoosePersona(id);
                    }}
                  />
                </>
              ) : (
                <ImageOptions
                  size={props.imageSize}
                  onSizeChange={props.onImageSizeChange}
                  publish={props.publishImage}
                  onPublishChange={props.onPublishImageChange}
                />
              )}
            </div>
            <ComposerActions
              prompt={prompt}
              mode={mode}
              cost={cost}
              busy={busy}
              hasChat={hasChat}
              onSubmit={onSubmit}
              onStop={props.onStop}
              onStartVoice={props.onStartVoice}
            />
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">Enter to send · Shift+Enter for a new line · AI can make mistakes</p>
      </div>
    </div>
  );
}
