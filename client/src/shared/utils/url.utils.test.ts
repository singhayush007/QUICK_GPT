import { describe, expect, it } from "vitest";
import { normalizeBaseUrl } from "./url.utils";

describe("normalizeBaseUrl", () => {
  it("strips one or many trailing slashes", () => {
    expect(normalizeBaseUrl("https://quickgptnode.vercel.app/")).toBe("https://quickgptnode.vercel.app");
    expect(normalizeBaseUrl("https://api.example.com///")).toBe("https://api.example.com");
  });
  it("leaves clean URLs alone and trims whitespace", () => {
    expect(normalizeBaseUrl("http://localhost:3000")).toBe("http://localhost:3000");
    expect(normalizeBaseUrl("  http://localhost:3000/  ")).toBe("http://localhost:3000");
  });
  it("keeps a path prefix intact", () => {
    expect(normalizeBaseUrl("https://host.com/v1/")).toBe("https://host.com/v1");
  });
  it("makes base + endpoint produce a single slash", () => {
    expect(`${normalizeBaseUrl("https://x.app/")}/api/message/stream`).toBe("https://x.app/api/message/stream");
  });
});
