import { test } from "node:test";
import assert from "node:assert/strict";
import { envSet } from "../shared/utils/env.js";

test("envSet: real values count as configured", () => {
  process.env.QG_TEST_REAL = "AIzaSyRealLookingKey123";
  assert.equal(envSet("QG_TEST_REAL"), true);
});

test("envSet: .env.example placeholders count as NOT configured", () => {
  for (const placeholder of ["your_gemini_api_key", "your_imagekit_public_key", "<paste-here>", "changeme", "xxx"]) {
    process.env.QG_TEST_PLACEHOLDER = placeholder;
    assert.equal(envSet("QG_TEST_PLACEHOLDER"), false, placeholder);
  }
});

test("envSet: missing or blank values are not configured", () => {
  delete process.env.QG_TEST_MISSING;
  process.env.QG_TEST_BLANK = "";
  assert.equal(envSet("QG_TEST_MISSING"), false);
  assert.equal(envSet("QG_TEST_BLANK"), false);
});
