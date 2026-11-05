import Razorpay from "razorpay";
import { envSet } from "../shared/utils/env.js";

// Created lazily: `new Razorpay()` throws when keys are missing, which used to
// crash the whole server at start-up.
let razorpayClient = null;

/** @returns {Razorpay} the shared client; throws when payments are not configured. */
export const getRazorpay = () => {
  if (!envSet("RAZORPAY_KEY_ID") || !envSet("RAZORPAY_KEY_SECRET")) {
    throw new Error("Payments are not configured on this server.");
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
};

export default getRazorpay;
