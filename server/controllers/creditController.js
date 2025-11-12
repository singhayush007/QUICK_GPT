import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const plans = [
  {
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
    features: [
      "100 text generations",
      "50 image generations",
      "Standard support",
      "Access to basic models",
    ],
  },
  {
    _id: "pro",
    name: "Pro",
    price: 20,
    credits: 500,
    features: [
      "500 text generations",
      "200 image generations",
      "Priority support",
      "Access to pro models",
      "Faster response time",
    ],
  },
  {
    _id: "premium",
    name: "Premium",
    price: 30,
    credits: 1000,
    features: [
      "1000 text generations",
      "500 image generations",
      "24/7 VIP support",
      "Access to premium models",
      "Dedicated account manager",
    ],
  },
];

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const getPlans = async (req, res) => {
  try {
    res.json({ success: true, plans });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    const plan = plans.find((p) => p._id === planId);
    if (!plan) return res.json({ success: false, message: "Invalid plan" });

    const transaction = await Transaction.create({
      userId,
      planId: plan._id,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false,
    });

    const options = {
      amount: plan.price * 100,
      currency: "INR",
      receipt: transaction._id.toString(),
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      transactionId: transaction._id,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature)
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });

    const transaction = await Transaction.findById(transactionId);
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });

    if (!transaction.isPaid) {
      transaction.isPaid = true;
      await transaction.save();
      await User.updateOne(
        { _id: transaction.userId },
        { $inc: { credits: transaction.credits } }
      );
    }

    res.json({ success: true, message: "Payment successful", transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
