import { describe, expect, it } from "vitest";
import { toChunks } from "./speech.utils";

describe("toChunks (premium voice chunking)", () => {
  it("starts with a SHORT first chunk so audio begins quickly", () => {
    const text = "This is the first sentence. " + "Here is another fairly long sentence that keeps going. ".repeat(10);
    const chunks = toChunks(text);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].length).toBeLessThanOrEqual(140);
  });
  it("never produces empty chunks and keeps all words", () => {
    const text = "One. Two! Three? Four.";
    const chunks = toChunks(text);
    expect(chunks.every((c) => c.trim().length > 0)).toBe(true);
    expect(chunks.join(" ").replace(/\s+/g, " ")).toBe("One. Two! Three? Four.");
  });
  it("hard-wraps a single run-on sentence", () => {
    const chunks = toChunks("word ".repeat(200).trim());
    expect(chunks.every((c) => c.length <= 300)).toBe(true);
  });
  it("handles Hindi sentence endings", () => {
    expect(toChunks("नमस्ते। आप कैसे हैं।").length).toBeGreaterThanOrEqual(1);
  });
});
