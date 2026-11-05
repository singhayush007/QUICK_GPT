import { test } from "node:test";
import assert from "node:assert/strict";
import { VOICES } from "../modules/voice/voices.constants.js";
import { canUseVoice, getVoice, voicesForUser } from "../modules/voice/voice.service.js";

test("voice catalogue: 4 male + 2 female premium voices plus the device voice", () => {
  assert.equal(VOICES.filter((v) => v.gender === "male").length, 4);
  assert.equal(VOICES.filter((v) => v.gender === "female").length, 2);
  assert.equal(getVoice("device").tier, "free");
});

test("free voices are open to everyone, Pro voices need a paid plan", () => {
  assert.equal(canUseVoice({ plan: "free" }, getVoice("puck")), true);
  assert.equal(canUseVoice({ plan: "free" }, getVoice("charon")), false);
  assert.equal(canUseVoice({ plan: "pro" }, getVoice("charon")), true);
});

test("voicesForUser reports the lock state and hides provider voice names", () => {
  const list = voicesForUser({ plan: "free" });
  assert.equal(list.filter((v) => v.locked).length, VOICES.filter((v) => v.tier === "pro").length);
  assert.ok(list.every((v) => !("gemini" in v)));
});
