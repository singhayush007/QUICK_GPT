import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { RAZORPAY_KEY_ID } from "@/shared/constants/config.constants";
import { getErrorMessage } from "@/shared/utils/error.utils";
import { useAuthStore } from "@/store/authStore";
import { RAZORPAY_THEME_COLOR } from "../constants/credits.constants";
import { creditsService } from "../services/credits.service";
import type { CreditPlan, RazorpaySuccessResponse } from "../types/credits.types";
import { loadRazorpayScript } from "../util/razorpay.utils";
import { PURCHASE_HISTORY_KEY } from "./UsePurchaseHistoryQuery";

/** Create order -> open Razorpay -> verify signature -> refresh balance + history. */
export function useRazorpayCheckout() {
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const queryClient = useQueryClient();
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const buy = async (plan: CreditPlan) => {
    setBuyingId(plan._id);
    try {
      const order = await creditsService.purchase(plan._id);
      if (!order.success) return void toast.error(order.message);

      if (!(await loadRazorpayScript()) || !window.Razorpay) return void toast.error("Razorpay SDK failed to load.");

      const verify = async (response: RazorpaySuccessResponse) => {
        try {
          const res = await creditsService.verify({ ...response, transactionId: order.transactionId });
          // the old code showed "success" even when the server said no
          if (!res.success) throw new Error(res.message);
          toast.success(`Payment successful! ${plan.credits} credits added.`);
          void fetchUser();
          void queryClient.invalidateQueries({ queryKey: PURCHASE_HISTORY_KEY });
        } catch (error) {
          toast.error(getErrorMessage(error, "Payment verification failed."));
        }
      };

      new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "QuickGPT",
        description: `${plan.name} plan — ${plan.credits} credits`,
        order_id: order.orderId,
        handler: verify,
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: RAZORPAY_THEME_COLOR },
      }).open();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBuyingId(null);
    }
  };

  return { buy, buyingId };
}
