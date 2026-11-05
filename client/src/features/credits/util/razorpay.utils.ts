import { RAZORPAY_SCRIPT_URL } from "../constants/credits.constants";

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
