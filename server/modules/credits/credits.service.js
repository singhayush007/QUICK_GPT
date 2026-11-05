import crypto from "crypto";
import Transaction from "./Transaction.js";
import User from "../auth/User.js";
import { getRazorpay } from "../../config/razorpay.client.js";
import { envSet } from "../../shared/utils/env.js";
import { AppError, badRequest, notFound } from "../../shared/utils/httpErrors.js";
import { PURCHASE_HISTORY_LIMIT } from "../../shared/constants/limits.js";
import { CURRENCY, PAID_USER_PLAN, PAISE_PER_RUPEE, PLANS } from "./plans.constants.js";

/** Constant-time comparison of a hex HMAC with the signature we received. */
const safeEqual = (expected, received) => {
  const a = Buffer.from(expected);
  const b = Buffer.from(String(received));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/** The plan catalogue shown on the Credits page. */
export const getPlans = () => PLANS;

/**
 * Creates an unpaid Transaction + a Razorpay order for a plan.
 * @throws {AppError} "Invalid plan"; plain Error when payments are not configured
 */
export async function createOrder(userId, planId) {
  const plan = PLANS.find((p) => p._id === planId);
  if (!plan) throw new AppError("Invalid plan");

  const razorpay = getRazorpay();
  const transaction = await Transaction.create({
    userId,
    planId: plan._id,
    amount: plan.price,
    credits: plan.credits,
    isPaid: false,
  });

  const order = await razorpay.orders.create({
    amount: plan.price * PAISE_PER_RUPEE,
    currency: CURRENCY,
    receipt: transaction._id.toString(),
    payment_capture: 1,
  });
  transaction.orderId = order.id;
  await transaction.save();

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    transactionId: transaction._id,
  };
}

/**
 * Atomic "unpaid -> paid" flip so webhook + verify can never double-credit.
 * Grants the credits (and the paid plan) only when this call won the flip.
 */
async function settleTransaction(filter, paymentId) {
  const flipped = await Transaction.findOneAndUpdate(
    { ...filter, isPaid: false },
    { isPaid: true, paymentId },
    { new: true }
  );
  if (flipped) {
    await User.updateOne(
      { _id: flipped.userId },
      { $inc: { credits: flipped.credits }, $set: { plan: PAID_USER_PLAN } }
    );
  }
  return flipped;
}

/**
 * Verifies the client-side Razorpay signature and credits the account.
 * @throws {AppError} 400 missing details / invalid signature, 404 unknown transaction
 */
export async function verifyPayment(userId, body) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    transactionId,
  } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw badRequest("Missing payment details");
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");
  if (!safeEqual(expected, razorpay_signature)) {
    throw badRequest("Invalid signature");
  }

  // The transaction must belong to the caller AND match the paid order,
  // otherwise one user's valid payment could credit another transaction.
  const transaction = await Transaction.findOne({
    _id: transactionId,
    userId,
    orderId: razorpay_order_id,
  });
  if (!transaction) throw notFound("Transaction not found");

  await settleTransaction({ _id: transaction._id }, razorpay_payment_id);
}

/** Paid purchases of the user, newest first. */
export const getPurchaseHistory = (userId) =>
  Transaction.find({ userId, isPaid: true })
    .sort({ createdAt: -1 })
    .limit(PURCHASE_HISTORY_LIMIT)
    .select("planId amount credits createdAt");

/**
 * Checks the webhook signature over the RAW body.
 * @returns {null | "Invalid request" | "Invalid signature"} null when valid
 */
export function checkWebhookSignature(rawBody, signature) {
  const secret = envSet("RAZORPAY_WEBHOOK_SECRET") ? process.env.RAZORPAY_WEBHOOK_SECRET : null;
  if (!secret || !signature || !Buffer.isBuffer(rawBody)) return "Invalid request";

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature) ? null : "Invalid signature";
}

/** Processes an (already verified) Razorpay webhook body; credits are granted exactly once. */
export async function handleWebhookEvent(rawBody) {
  const event = JSON.parse(rawBody.toString("utf8"));

  if (event.event === "payment.captured") {
    const { receipt, id: paymentId } = event.payload.payment.entity;
    await settleTransaction({ _id: receipt }, paymentId);
  }
}
