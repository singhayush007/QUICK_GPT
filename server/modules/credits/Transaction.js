import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: { type: String, required: true },
    amount: { type: Number, required: true },
    credits: { type: Number, required: true },
    orderId: { type: String, index: true },
    paymentId: { type: String },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
