import { useQuery } from "@tanstack/react-query";
import { creditsService } from "../services/credits.service";

export const PURCHASE_HISTORY_KEY = ["credit-history"] as const;

/** Paid purchases of the current user (a nice-to-have: failures are silent). */
export function usePurchaseHistoryQuery() {
  const { data } = useQuery({ queryKey: PURCHASE_HISTORY_KEY, queryFn: creditsService.history, retry: false });
  return data?.success ? data.items : [];
}
