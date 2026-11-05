import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "@/shared/utils/error.utils";
import { shareService } from "../services/share.service";

/** Loads a public shared chat. Not-found is a normal outcome, so no retries. */
export function useSharedChatQuery(shareId: string | undefined) {
  const query = useQuery({
    queryKey: ["shared-chat", shareId],
    queryFn: () => shareService.byId(shareId as string),
    enabled: Boolean(shareId),
    retry: false,
  });
  const chat = query.data?.success ? query.data.chat : null;
  const error = query.error ? getErrorMessage(query.error, "Could not load this chat") : null;
  return { chat, error, loading: query.isPending };
}
