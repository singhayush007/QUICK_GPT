import { describe, expect, it } from "vitest";
import { resolveCheckoutKey } from "./razorpay.utils";

describe("resolveCheckoutKey", () => {
  it("prefers the key id the server created the order with", () => {
    expect(resolveCheckoutKey("rzp_live_server", "rzp_test_env")).toBe("rzp_live_server");
  });
  it("falls back to the build-time env key", () => {
    expect(resolveCheckoutKey(undefined, "rzp_test_env")).toBe("rzp_test_env");
    expect(resolveCheckoutKey("  ", "rzp_test_env")).toBe("rzp_test_env");
  });
  it("returns undefined when no key is available (so the UI can show a clear message)", () => {
    expect(resolveCheckoutKey(undefined, undefined)).toBeUndefined();
    expect(resolveCheckoutKey("", "")).toBeUndefined();
  });
});
