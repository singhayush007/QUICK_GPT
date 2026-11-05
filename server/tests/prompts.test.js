import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHistory, systemPromptFor } from "../modules/message/ai.service.js";

test("systemPromptFor adds a persona that outranks earlier turns", () => {
  const prompt = systemPromptFor("translator");
  assert.match(prompt, /PERSONA:/);
  assert.match(prompt, /every reply from now on/);
  assert.ok(!/PERSONA:/.test(systemPromptFor("default")));
  assert.ok(!/PERSONA:/.test(systemPromptFor("does-not-exist")));
});

test("systemPromptFor adds the speakable-answer hint only in voice mode", () => {
  assert.match(systemPromptFor("default", true), /VOICE MODE/);
  assert.ok(!/VOICE MODE/.test(systemPromptFor("default", false)));
});

test("the base prompt tells the model to trust [LIVE DATA] blocks", () => {
  assert.match(systemPromptFor("default"), /LIVE DATA/);
});

test("buildHistory keeps only text turns and respects the limit", () => {
  const chat = {
    messages: [
      { role: "user", content: "q1", isImage: false },
      { role: "assistant", content: "http://img", isImage: true },
      ...Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `m${i}`, isImage: false })),
    ],
  };
  const history = buildHistory(chat, 6);
  assert.equal(history.length, 6);
  assert.ok(history.every((m) => m.content.startsWith("m")), "images and old turns are dropped");
  assert.deepEqual(Object.keys(history[0]).sort(), ["content", "role"]);
});
