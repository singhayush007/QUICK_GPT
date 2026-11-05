/**
 * Removes whitespace and trailing slashes from a base URL.
 *
 * `VITE_SERVER_URL=https://api.example.com/` used to work for axios (it joins URLs smartly) but broke
 * the streaming `fetch` call: `https://api.example.com//api/...` gets a 308 redirect on Vercel, and
 * browsers refuse to follow a redirect on a CORS preflight, so only chat streaming failed.
 */
export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}
