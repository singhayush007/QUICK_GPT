import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app.js";

// Exercises the real Express app (middleware, routing, error handling) without a database.
let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const json = async (res) => ({ status: res.status, body: await res.json() });

test("GET /api/health reports which integrations are configured", async () => {
  const { status, body } = await json(await fetch(`${base}/api/health`));
  assert.equal(status, 200);
  assert.equal(body.status, "ok");
  assert.deepEqual(Object.keys(body.features).sort(), ["gemini", "images", "openRouter", "payments"]);
});

test("unknown routes answer with a JSON 404", async () => {
  const { status, body } = await json(await fetch(`${base}/api/nope`));
  assert.equal(status, 404);
  assert.equal(body.success, false);
});

test("protected routes reject missing and invalid tokens with 401", async () => {
  for (const path of ["/api/user/data", "/api/chat/get", "/api/message/models", "/api/live/markets", "/api/voice/list"]) {
    assert.equal((await fetch(`${base}${path}`)).status, 401, path);
  }
  const bad = await fetch(`${base}/api/user/data`, { headers: { Authorization: "garbage" } });
  assert.equal(bad.status, 401);
});

test("malformed JSON gets a clean 400 (no parser internals leaked)", async () => {
  const { status, body } = await json(
    await fetch(`${base}/api/user/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad" }),
  );
  assert.equal(status, 400);
  assert.equal(body.message, "Invalid JSON in request body");
});

test("oversized bodies are rejected with 413", async () => {
  const res = await fetch(`${base}/api/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "a".repeat(200_000) }),
  });
  assert.equal(res.status, 413);
});

test("CORS preflight is answered and security headers are present", async () => {
  const pre = await fetch(`${base}/api/user/login`, {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173", "Access-Control-Request-Method": "POST" },
  });
  assert.equal(pre.status, 204);
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
});

test("login/register validate input types before touching the database", async () => {
  const res = await fetch(`${base}/api/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "x", email: { $gt: "" }, password: "secret1" }),
  });
  const body = await res.json();
  assert.equal(body.success, false);
  assert.match(body.message, /required/i);
});
