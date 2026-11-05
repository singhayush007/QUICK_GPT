/** Credit plans sold through Razorpay (prices in INR rupees). */
export const PLANS = [
  {
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
    features: [
      "100 text generations (Flash / Lite)",
      "50 image generations",
      "Standard support",
      "Unlocks the Pro model + 4 Pro voices",
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
      "Unlocks the Pro model + 4 Pro voices",
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
      "Unlocks the Pro model + 4 Pro voices",
      "Dedicated account manager",
    ],
  },
];

export const CURRENCY = "INR";
/** Razorpay amounts are in the smallest unit (paise). */
export const PAISE_PER_RUPEE = 100;
/** Account plan granted after any paid purchase (unlocks Pro models / voices). */
export const PAID_USER_PLAN = "pro";
