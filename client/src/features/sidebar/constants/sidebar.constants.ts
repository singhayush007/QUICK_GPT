import { Gem, Images, Radio, type LucideIcon } from "lucide-react";

/** Balance at which the credits bar is full. */
export const MAX_CREDITS_BAR = 100;
/** Under this balance the bar turns red. */
export const LOW_CREDITS = 5;

export const NAV_ITEMS: ReadonlyArray<{ to: string; label: string; icon: LucideIcon }> = [
  { to: "/live", label: "Live · Markets & Sports", icon: Radio },
  { to: "/community", label: "Community", icon: Images },
  { to: "/credits", label: "Credits & plans", icon: Gem },
];
