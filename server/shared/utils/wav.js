/** Default PCM sample rate returned by Gemini TTS (Hz). */
export const DEFAULT_PCM_SAMPLE_RATE = 24000;

/**
 * Raw 16-bit mono PCM (24 kHz) -> WAV file, so browsers can play it directly.
 * @param {Buffer} pcm raw little-endian 16-bit mono samples
 * @param {number} [sampleRate]
 * @returns {Buffer}
 */
export const pcmToWav = (pcm, sampleRate = DEFAULT_PCM_SAMPLE_RATE) => {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
};
