import { create } from "zustand";
import { STORAGE_KEYS } from "@/shared/constants/storage.constants";
import { storage } from "@/shared/utils/storage.utils";

export type VoiceLang = "en-IN" | "hi-IN";

interface PreferencesState {
  /** Selected AI model id (falls back to the first unlocked one when locked/unknown). */
  modelId: string;
  personaId: string;
  /** Voice the AI answers with ("device" = the browser's built-in voice). */
  voiceId: string;
  voiceLang: VoiceLang;
  setModelId: (id: string) => void;
  setPersonaId: (id: string) => void;
  setVoiceId: (id: string) => void;
  toggleVoiceLang: () => VoiceLang;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  modelId: storage.get(STORAGE_KEYS.model) || "flash",
  personaId: storage.get(STORAGE_KEYS.persona) || "default",
  voiceId: storage.get(STORAGE_KEYS.voice) || "device",
  voiceLang: storage.get(STORAGE_KEYS.voiceLang) === "hi-IN" ? "hi-IN" : "en-IN",

  setModelId: (modelId) => {
    storage.set(STORAGE_KEYS.model, modelId);
    set({ modelId });
  },
  setPersonaId: (personaId) => {
    storage.set(STORAGE_KEYS.persona, personaId);
    set({ personaId });
  },
  setVoiceId: (voiceId) => {
    storage.set(STORAGE_KEYS.voice, voiceId);
    set({ voiceId });
  },
  toggleVoiceLang: () => {
    const next: VoiceLang = get().voiceLang === "en-IN" ? "hi-IN" : "en-IN";
    storage.set(STORAGE_KEYS.voiceLang, next);
    set({ voiceLang: next });
    return next;
  },
}));
