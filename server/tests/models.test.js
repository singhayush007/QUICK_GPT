import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_MODEL, MODELS, canUseModel, getModel, modelsForUser } from "../modules/message/models.constants.js";
import { pickModel } from "../modules/message/message.service.js";

const freeUser = { plan: "free" };
const proUser = { plan: "pro" };

test("catalogue has two free models and one Pro model", () => {
  assert.deepEqual(MODELS.map((m) => [m.id, m.tier]), [["lite", "free"], ["flash", "free"], ["pro", "pro"]]);
});

test("every model has a non-empty chain of provider ids and a positive cost", () => {
  for (const m of MODELS) {
    assert.ok(m.chain.length > 0, m.id);
    assert.ok(m.cost >= 1, m.id);
  }
  assert.ok(getModel("pro").cost > getModel("flash").cost, "Pro should cost more than Flash");
});

test("getModel falls back to the default for unknown ids", () => {
  assert.equal(getModel("evil").id, DEFAULT_MODEL);
  assert.equal(getModel(undefined).id, DEFAULT_MODEL);
});

test("free users cannot use Pro, paid users can", () => {
  assert.equal(canUseModel(freeUser, getModel("flash")), true);
  assert.equal(canUseModel(freeUser, getModel("pro")), false);
  assert.equal(canUseModel(proUser, getModel("pro")), true);
});

test("modelsForUser marks Pro as locked for free users and never leaks provider ids", () => {
  const list = modelsForUser(freeUser);
  assert.equal(list.find((m) => m.id === "pro").locked, true);
  assert.equal(list.find((m) => m.id === "flash").locked, false);
  assert.ok(list.every((m) => !("chain" in m)));
  assert.equal(modelsForUser(proUser).find((m) => m.id === "pro").locked, false);
});

test("pickModel enforces the Pro lock with UPGRADE_REQUIRED (403)", () => {
  assert.throws(() => pickModel(freeUser, "pro"), (err) => err.status === 403 && err.code === "UPGRADE_REQUIRED");
  assert.equal(pickModel(proUser, "pro").id, "pro");
  assert.equal(pickModel(freeUser, "not-a-model").id, DEFAULT_MODEL);
});
