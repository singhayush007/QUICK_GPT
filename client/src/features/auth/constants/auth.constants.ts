import { Image as ImageIcon, MessageSquareText, Zap, type LucideIcon } from "lucide-react";

export const MIN_PASSWORD_LENGTH = 6;

export const LOGIN_FEATURES: ReadonlyArray<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Zap, title: "Streaming replies", text: "Answers appear token-by-token, with a Stop button." },
  { icon: ImageIcon, title: "AI image studio", text: "Turn a sentence into an image and share it with the community." },
  { icon: MessageSquareText, title: "Live data", text: "Weather and sports scores woven into answers." },
];
