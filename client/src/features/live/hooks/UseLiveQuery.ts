import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getErrorMessage } from "@/shared/utils/error.utils";
import type { ApiResponse } from "@/shared/types";
import type { LiveResult } from "../types/live.types";

interface Options {
  enabled: boolean;
  /** Auto-refresh interval in ms (paused while the browser tab is hidden). */
  refreshMs: number;
}

type Unwrap<R> = R extends { success: true } ? Omit<R, "success"> : never;

/**
 * Shared TanStack Query wrapper for every Live panel: auto-refresh, one retry on
 * server errors only (a 404 "city not found" is a normal answer), and a uniform result shape.
 */
export function useLiveQuery<R extends ApiResponse<object>, T>(
  queryKey: readonly unknown[],
  fetcher: () => Promise<R>,
  pick: (res: Unwrap<Extract<R, { success: true }>>) => T,
  { enabled, refreshMs }: Options,
): LiveResult<T> {
  const query = useQuery({
    queryKey: ["live", ...queryKey],
    queryFn: fetcher,
    enabled,
    refetchInterval: refreshMs,
    staleTime: 0,
    retry: (count, error) => count < 1 && (!isAxiosError(error) || !error.response || error.response.status >= 500),
  });

  const ok = query.data && query.data.success ? (query.data as Extract<R, { success: true }>) : null;
  return {
    data: ok ? pick(ok as unknown as Unwrap<Extract<R, { success: true }>>) : null,
    error: query.error ? getErrorMessage(query.error, "Something went wrong") : query.data && !query.data.success ? query.data.message : null,
    loading: enabled && query.isPending,
    refreshing: query.isFetching && !query.isPending,
    updatedAt: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    refresh: () => void query.refetch(),
  };
}
