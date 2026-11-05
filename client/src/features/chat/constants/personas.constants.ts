import { BookOpen, Code2, Languages, MessagesSquare, PenLine, Sparkles, type LucideIcon } from "lucide-react";

export interface Persona {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}

/** Must match the ids in server/modules/message/personas.constants.js. */
export const PERSONAS: readonly Persona[] = [
  { id: "default", label: "Assistant", desc: "Balanced, general purpose", icon: Sparkles },
  { id: "coder", label: "Code expert", desc: "Idiomatic code + edge cases", icon: Code2 },
  { id: "tutor", label: "Tutor", desc: "Step-by-step with analogies", icon: BookOpen },
  { id: "writer", label: "Writer", desc: "Polished, concise copy", icon: PenLine },
  { id: "interviewer", label: "Mock interviewer", desc: "One question at a time", icon: MessagesSquare },
  { id: "translator", label: "Translator", desc: "Hindi ⇄ English", icon: Languages },
];
