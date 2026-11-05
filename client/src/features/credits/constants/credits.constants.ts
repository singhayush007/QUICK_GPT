/** The plan highlighted as "Most popular". */
export const POPULAR_PLAN_ID = "pro";

export const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
export const RAZORPAY_THEME_COLOR = "#8b5cf6";

/** Pro replies cost this many credits (shown in plan cards). Mirrors the server's catalogue. */
export const PRO_REPLY_COST = 3;
export const IMAGE_CREDIT_COST = 2;

export const FAQ: ReadonlyArray<readonly [question: string, answer: string]> = [
  ["Do credits expire?", "No. Buy once and use them whenever you like."],
  ["What does the Pro model do?", "It is our most capable model for hard reasoning and coding. Any plan unlocks it; each Pro reply costs 3 credits."],
  ["What if a reply fails?", "You're only charged for answers that are delivered — failed or stopped requests are refunded automatically."],
];
