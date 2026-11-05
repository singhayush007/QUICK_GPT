import { normalizeBaseUrl } from "@/shared/utils/url.utils";

/**
 * Base URL of the QuickGPT API (see client/.env.example). Trailing slashes are removed so
 * `${SERVER_URL}/api/...` never becomes `//api/...` (which breaks the streaming fetch on Vercel).
 */
export const SERVER_URL: string = normalizeBaseUrl(import.meta.env.VITE_SERVER_URL || "http://localhost:3000");

/** Public Razorpay key used by the checkout widget. */
export const RAZORPAY_KEY_ID: string | undefined = import.meta.env.VITE_RAZORPAY_KEY_ID;
