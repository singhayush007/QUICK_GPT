import crypto from "crypto";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const razorpayWebhooks = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid signature");
  }

  try {
    const event = req.body;

    if (event.event === "payment.captured") {
      const { receipt } = event.payload.payment.entity;
      const transaction = await Transaction.findOne({
        _id: receipt,
        isPaid: false,
      });
      if (transaction) {
        // Update user credits
        await User.updateOne(
          { _id: transaction.userId },
          { $inc: { credits: transaction.credits } }
        );

        // Mark transaction as paid
        transaction.isPaid = true;
        await transaction.save();
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Internal Server Error");
  }
};
