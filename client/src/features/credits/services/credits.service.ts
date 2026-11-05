import { api } from "@/shared/api/api";
import { API_PATHS } from "@/shared/constants/apiPaths.constants";
import type { HistoryResponse, PlansResponse, PurchaseResponse, VerifyPaymentPayload, VerifyResponse } from "../types/credits.types";

export const creditsService = {
  plans: () => api.get<PlansResponse>(API_PATHS.credit.plans),
  history: () => api.get<HistoryResponse>(API_PATHS.credit.history),
  purchase: (planId: string) => api.post<PurchaseResponse>(API_PATHS.credit.purchase, { planId }),
  verify: (payload: VerifyPaymentPayload) => api.post<VerifyResponse>(API_PATHS.credit.verify, payload),
};
