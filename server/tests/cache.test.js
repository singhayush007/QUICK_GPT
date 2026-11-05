import { test } from "node:test";
import assert from "node:assert/strict";
import { cached, createBoundedCache, withRetry } from "../shared/utils/cache.js";

const upstreamError = (status) => Object.assign(new Error(`HTTP ${status}`), { response: { status } });

test("cached: a fresh value is served without calling the loader again", async () => {
  let calls = 0;
  const loader = async () => ++calls;
  assert.equal(await cached("fresh-key", 60_000, loader), 1);
  assert.equal(await cached("fresh-key", 60_000, loader), 1);
  assert.equal(calls, 1);
});

test("cached: stale-if-error returns the last good value when the provider fails", async () => {
  let fail = false;
  const loader = async () => {
    if (fail) throw new Error("provider down");
    return "good";
  };
  assert.equal(await cached("stale-key", 0, loader), "good"); // ttl 0 => immediately stale
  fail = true;
  assert.equal(await cached("stale-key", 0, loader), "good");
});

test("cached: with no previous value the error is propagated", async () => {
  await assert.rejects(() => cached("never-loaded", 0, async () => { throw upstreamError(404); }), /404/);
});

test("withRetry retries once on 5xx but not on 4xx", async () => {
  let calls = 0;
  const flaky = async () => {
    if (++calls === 1) throw upstreamError(503);
    return "ok";
  };
  assert.equal(await withRetry(flaky), "ok");
  assert.equal(calls, 2);

  let clientErrorCalls = 0;
  await assert.rejects(() => withRetry(async () => { clientErrorCalls++; throw upstreamError(404); }));
  assert.equal(clientErrorCalls, 1);
});

test("createBoundedCache evicts the oldest entry", () => {
  const c = createBoundedCache(2);
  c.set("a", 1); c.set("b", 2); c.set("c", 3);
  assert.equal(c.get("a"), undefined);
  assert.equal(c.get("c"), 3);
});
