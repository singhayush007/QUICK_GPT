import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDate, greeting, timeAgo } from "./time.utils";

afterEach(() => vi.useRealTimers());

describe("timeAgo", () => {
  it("is 'just now' for very recent times", () => {
    expect(timeAgo(Date.now() - 5_000)).toBe("just now");
  });
  it("uses minutes, hours and days", () => {
    expect(timeAgo(Date.now() - 5 * 60_000)).toMatch(/5 minutes ago/);
    expect(timeAgo(Date.now() - 3 * 3600_000)).toMatch(/3 hours ago/);
    expect(timeAgo(Date.now() - 2 * 86400_000)).toMatch(/2 days ago/);
  });
});

describe("greeting", () => {
  it("changes with the time of day", () => {
    expect(greeting(new Date("2026-01-01T08:00:00"))).toBe("Good morning");
    expect(greeting(new Date("2026-01-01T14:00:00"))).toBe("Good afternoon");
    expect(greeting(new Date("2026-01-01T21:00:00"))).toBe("Good evening");
  });
});

describe("formatDate", () => {
  it("formats as day + short month + year", () => {
    expect(formatDate("2026-11-04T10:00:00Z")).toMatch(/4 Nov 2026/);
  });
});
