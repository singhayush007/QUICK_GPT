/**
 * True when an env var holds a REAL value. `.env.example` ships placeholders such as
 * `your_gemini_api_key`; copying it verbatim must count as "not configured" instead of
 * sending requests with fake credentials to ImageKit / Razorpay / OpenRouter / Gemini.
 * @param {string} name environment variable name
 * @returns {boolean}
 */
export const envSet = (name) => {
  const v = process.env[name];
  return Boolean(v) && !/^(your_|<|changeme|xxx)/i.test(v.trim());
};
