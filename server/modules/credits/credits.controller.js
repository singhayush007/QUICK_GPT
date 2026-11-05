import * as creditsService from "./credits.service.js";
import { AppError, errorBody } from "../../shared/utils/httpErrors.js";

export const getPlans = async (req, res) => {
  try {
    res.json({ success: true, plans: creditsService.getPlans() });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const order = await creditsService.createOrder(req.user._id, planId);
    res.json({ success: true, ...order });
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
    await creditsService.verifyPayment(req.user._id, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
    });
    res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json(errorBody(error));
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Paid purchases of the current user, newest first
export const getHistory = async (req, res) => {
  try {
    const items = await creditsService.getPurchaseHistory(req.user._id);
    res.json({ success: true, items });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
