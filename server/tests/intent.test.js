import { test } from "node:test";
import assert from "node:assert/strict";
import { detectRealTimeIntent, extractCity, summariseMatches } from "../modules/live/intent.util.js";

test("extractCity pulls the city out of natural weather questions", () => {
  assert.equal(extractCity("What's the weather in Mumbai right now?"), "Mumbai");
  assert.equal(extractCity("Pune weather today"), "Pune");
  assert.equal(extractCity("Is it raining in New Delhi?"), "New Delhi");
});

test("extractCity falls back to Delhi when no city is mentioned", () => {
  assert.equal(extractCity("hello there"), "Delhi");
  assert.equal(extractCity("hello", "Mumbai"), "Mumbai");
});

test("detectRealTimeIntent recognises each live-data topic", () => {
  assert.equal(detectRealTimeIntent("what is the weather").weather, true);
  assert.equal(detectRealTimeIntent("delhi AQI today").aqi, true);
  assert.equal(detectRealTimeIntent("how is nifty doing").markets, true);
  assert.equal(detectRealTimeIntent("bitcoin price").markets, true);
  assert.equal(detectRealTimeIntent("IPL score").cricket, true);
  assert.equal(detectRealTimeIntent("premier league table").football, true);
  assert.equal(detectRealTimeIntent("NBA scores").basketball, true);
});

test("detectRealTimeIntent stays quiet for ordinary prompts", () => {
  const intent = detectRealTimeIntent("explain how JWT works");
  assert.deepEqual(Object.values(intent).filter(Boolean), []);
});

test("one prompt can ask for several live topics at once", () => {
  const intent = detectRealTimeIntent("Delhi weather, AQI and nifty today");
  assert.equal(intent.weather && intent.aqi && intent.markets, true);
});

test("summariseMatches flags live games and trims the list", () => {
  const matches = Array.from({ length: 30 }, (_, i) => ({
    league: "L", state: i === 0 ? "in" : "pre", status: "s", summary: "", venue: "v", date: "d",
    teams: [{ name: "A", score: "1" }, { name: "B", score: "2" }],
  }));
  const out = summariseMatches(matches, 5);
  assert.equal(out.length, 5);
  assert.match(out[0].status, /^LIVE/);
  assert.equal(out[0].match, "A 1 vs B 2");
});
