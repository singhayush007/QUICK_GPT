import { describe, expect, it } from "vitest";
import { readSSE } from "./sse.utils";

const streamOf = (...parts: string[]): Response => {
  const enc = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      parts.forEach((p) => controller.enqueue(enc.encode(p)));
      controller.close();
    },
  });
  return new Response(body);
};

describe("readSSE", () => {
  it("parses data frames in order", async () => {
    const events: unknown[] = [];
    await readSSE(streamOf('data: {"type":"token","text":"Hel"}\n\ndata: {"type":"done"}\n\n'), (e) => events.push(e));
    expect(events).toEqual([{ type: "token", text: "Hel" }, { type: "done" }]);
  });
  it("reassembles a frame that is split across network chunks", async () => {
    const events: unknown[] = [];
    await readSSE(streamOf('data: {"type":"tok', 'en","text":"x"}\n', "\ndata: 1\n\n"), (e) => events.push(e));
    expect(events).toEqual([{ type: "token", text: "x" }, 1]);
  });
  it("ignores frames without a data line", async () => {
    const events: unknown[] = [];
    await readSSE(streamOf(": keep-alive\n\ndata: 2\n\n"), (e) => events.push(e));
    expect(events).toEqual([2]);
  });
});
