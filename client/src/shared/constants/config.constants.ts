/** Base URL of the QuickGPT API (see client/.env.example). */
export const SERVER_URL: string = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

/** Public Razorpay key used by the checkout widget. */
export const RAZORPAY_KEY_ID: string | undefined = import.meta.env.VITE_RAZORPAY_KEY_ID;
