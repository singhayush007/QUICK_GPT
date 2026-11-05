import type { ApiResponse } from "@/shared/types";

export interface CreditPlan {
  _id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
}

export interface PurchaseHistoryItem {
  _id: string;
  planId: string;
  amount: number;
  credits: number;
  createdAt: string;
}

export interface PurchaseOrder {
  orderId: string;
  amount: number;
  currency: string;
  transactionId: string;
  /** Public Razorpay key id sent by the server together with the order. */
  keyId?: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  transactionId: string;
}

export type PlansResponse = ApiResponse<{ plans: CreditPlan[] }>;
export type HistoryResponse = ApiResponse<{ items: PurchaseHistoryItem[] }>;
export type PurchaseResponse = ApiResponse<PurchaseOrder>;
export type VerifyResponse = ApiResponse<{ message: string }>;

// --- Razorpay checkout widget (loaded from their CDN) ---
export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
export interface RazorpayOptions {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  prefill: { name: string; email: string };
  theme: { color: string };
}
export interface RazorpayInstance {
  open: () => void;
}
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
