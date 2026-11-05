import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { voiceService } from "@/shared/services/voice.service";
import type { VoiceInfo } from "@/shared/types/voice.types";

/** Catalogue of voices; lock state depends on the user's plan, so the plan is part of the key. */
export function useVoicesQuery(): VoiceInfo[] {
  const userId = useAuthStore((s) => s.user?._id);
  const plan = useAuthStore((s) => s.user?.plan);
  const { data } = useQuery({
    queryKey: ["voices", userId, plan],
    queryFn: voiceService.list,
    enabled: Boolean(userId),
    select: (res) => (res.success ? res.voices : []),
  });
  return data ?? [];
}
