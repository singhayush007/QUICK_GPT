import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { FALLBACK_MODEL } from "../constants/chat.constants";
import { messageService } from "../services/message.service";
import type { ModelInfo } from "../types/chat.types";

/** Model catalogue; lock state depends on the user's plan, so the plan is part of the key. */
export function useModelsQuery(): ModelInfo[] {
  const userId = useAuthStore((s) => s.user?._id);
  const plan = useAuthStore((s) => s.user?.plan);
  const { data } = useQuery({
    queryKey: ["models", userId, plan],
    queryFn: messageService.models,
    enabled: Boolean(userId),
    select: (res) => (res.success ? res.models : []),
  });
  return data ?? [];
}

/** The model that will be used: the saved one, or the first unlocked one when it's locked / unknown. */
export function useActiveModel(models: ModelInfo[]): ModelInfo {
  const modelId = usePreferencesStore((s) => s.modelId);
  return useMemo(
    () => models.find((m) => m.id === modelId && !m.locked) || models.find((m) => !m.locked) || FALLBACK_MODEL,
    [models, modelId],
  );
}
