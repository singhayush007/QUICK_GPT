import { describe, expect, it } from "vitest";
import { inr, makeTitle, stripMarkdown } from "./format.utils";

describe("inr", () => {
  it("formats numbers the Indian way", () => {
    expect(inr(2336054.5)).toBe("23,36,054.50");
    expect(inr(1234.5, 0)).toMatch(/1,23[45]/);
  });
  it("shows a dash for missing values", () => {
    expect(inr(null)).toBe("—");
    expect(inr(undefined)).toBe("—");
  });
});

describe("makeTitle", () => {
  it("keeps short text as is", () => {
    expect(makeTitle("hello world")).toBe("hello world");
  });
  it("cuts at a word boundary and adds an ellipsis", () => {
    const t = makeTitle("What's the weather in London right now, and what should I wear today?");
    expect(t).toBe("What's the weather in London right now…");
    expect(t.length).toBeLessThanOrEqual(41);
  });
  it("drops dangling punctuation before the ellipsis", () => {
    expect(makeTitle("Explain how JWT authentication works, with a simple example")).not.toMatch(/[,;:]…$/);
  });
  it("collapses whitespace", () => {
    expect(makeTitle("  a   b \n c  ")).toBe("a b c");
  });
});

describe("stripMarkdown", () => {
  it("removes formatting so text-to-speech doesn't read symbols", () => {
    expect(stripMarkdown("**Bold** and `code` with a [link](http://x.com)")).toBe("Bold and code with a link");
  });
  it("replaces code blocks with a spoken placeholder", () => {
    expect(stripMarkdown("before\n```js\nconst a = 1;\n```\nafter")).toContain("code block omitted");
    expect(stripMarkdown("```js\nsecret()\n```")).not.toContain("secret");
  });
  it("drops headings, bullets and table pipes", () => {
    expect(stripMarkdown("# Title\n- one\n- two")).toBe("Title one two");
  });
});
