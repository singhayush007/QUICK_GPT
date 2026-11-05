import { RAZORPAY_SCRIPT_URL } from "../constants/credits.constants";

/**
 * Key id for the checkout widget: the one the server used to create the order wins (it always matches),
 * the build-time env var is only a fallback. Returns undefined when neither is available.
 */
export function resolveCheckoutKey(orderKeyId?: string, envKeyId?: string): string | undefined {
  return orderKeyId?.trim() || envKeyId?.trim() || undefined;
}

/** Loads the Razorpay checkout script once. Resolves false when it can't be loaded. */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
