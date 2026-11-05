export type Plan = "free" | "pro";

export interface User {
  _id: string;
  name: string;
  email: string;
  credits: number;
  plan: Plan;
  createdAt?: string;
}
