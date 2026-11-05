import { CloudSun, Code2, Image as ImageIcon, Lightbulb, type LucideIcon } from "lucide-react";
import type { ComposerMode, ImageSize } from "../types/chat.types";

/** Must match MAX_PROMPT_LENGTH on the server. */
export const MAX_PROMPT_LENGTH = 4000;
/** Credits charged per generated image (text cost depends on the model). */
export const IMAGE_COST = 2;
/** Distance from the bottom (px) under which the list keeps following new tokens. */
export const STICK_TO_BOTTOM_THRESHOLD = 120;
export const TEXTAREA_MAX_HEIGHT = 200;

/** Used until the models catalogue has loaded. */
export const FALLBACK_MODEL = { id: "flash", name: "Flash", tagline: "", cost: 1, tier: "free", locked: false } as const;

export interface Suggestion {
  icon: LucideIcon;
  title: string;
  prompt: string;
  mode: ComposerMode;
}

export const SUGGESTIONS: readonly Suggestion[] = [
  { icon: Lightbulb, title: "Explain a concept", prompt: "Explain how JWT authentication works, with a simple example", mode: "text" },
  { icon: Code2, title: "Write some code", prompt: "Write a debounce function in JavaScript with a short explanation", mode: "text" },
  { icon: CloudSun, title: "Live weather & AQI", prompt: "What's the weather and AQI in Delhi right now?", mode: "text" },
  { icon: ImageIcon, title: "Generate an image", prompt: "A futuristic city skyline at sunset, neon lights, ultra detailed", mode: "image" },
];

export const IMAGE_SIZES: ReadonlyArray<{ id: ImageSize; label: string }> = [
  { id: "square", label: "Square" },
  { id: "landscape", label: "Landscape" },
  { id: "portrait", label: "Portrait" },
];
