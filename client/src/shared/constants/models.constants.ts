import { Crown, Rocket, Zap, type LucideIcon } from "lucide-react";

/** UI-only metadata. The real catalogue (cost / lock state) comes from the server. */
export const MODEL_META: Record<string, { label: string; icon: LucideIcon }> = {
  lite: { label: "Lite", icon: Zap },
  flash: { label: "Flash", icon: Rocket },
  pro: { label: "Pro", icon: Crown },
};

export const modelLabel = (id?: string): string | undefined => (id ? MODEL_META[id]?.label : undefined);
