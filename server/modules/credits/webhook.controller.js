import { checkWebhookSignature, handleWebhookEvent } from "./credits.service.js";

/**
 * Razorpay webhook. Must be mounted with express.raw() — the signature is
 * computed over the exact bytes Razorpay sent, so re-serialising a parsed
 * body (the old approach) never matches.
 */
export const razorpayWebhooks = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  const problem = checkWebhookSignature(req.body, signature);
  if (problem) return res.status(400).send(problem);

  try {
    await handleWebhookEvent(req.body);
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Internal Server Error");
  }
};
