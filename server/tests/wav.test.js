import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PCM_SAMPLE_RATE, pcmToWav } from "../shared/utils/wav.js";

test("pcmToWav wraps raw PCM in a valid 44-byte WAV header", () => {
  const pcm = Buffer.alloc(48000); // 1 second of 24 kHz 16-bit mono
  const wav = pcmToWav(pcm);
  assert.equal(wav.length, 44 + pcm.length);
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.toString("ascii", 8, 12), "WAVE");
  assert.equal(wav.readUInt16LE(22), 1, "mono");
  assert.equal(wav.readUInt32LE(24), DEFAULT_PCM_SAMPLE_RATE);
  assert.equal(wav.readUInt16LE(34), 16, "16-bit");
  assert.equal(wav.readUInt32LE(40), pcm.length, "data size");
});

test("pcmToWav honours a custom sample rate", () => {
  const wav = pcmToWav(Buffer.alloc(10), 16000);
  assert.equal(wav.readUInt32LE(24), 16000);
  assert.equal(wav.readUInt32LE(28), 32000, "byte rate = rate * 2");
});
