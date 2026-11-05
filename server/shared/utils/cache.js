/** One quick retry delay for network blips (ms). */
const RETRY_DELAY_MS = 400;
/** Upper bound of entries kept by the shared TTL cache. */
const TTL_CACHE_MAX_ENTRIES = 200;

const cache = new Map();

/**
 * One quick retry for network blips / 5xx / 429 — public APIs hiccup now and then.
 * @template T
 * @param {() => Promise<T>} loader
 * @returns {Promise<T>}
 */
export async function withRetry(loader) {
  try {
    return await loader();
  } catch (error) {
    const status = error.response?.status;
    if (error.response && status < 500 && status !== 429) throw error;
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    return loader();
  }
}

/**
 * TTL cache + "stale-if-error": when the provider is down we keep showing the last
 * good answer instead of an empty error page.
 * @template T
 * @param {string} key cache key
 * @param {number} ttlMs how long a value counts as fresh
 * @param {() => Promise<T>} loader produces a fresh value
 * @returns {Promise<T>}
 */
export async function cached(key, ttlMs, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  try {
    const value = await withRetry(loader);
    cache.set(key, { at: Date.now(), value });
    if (cache.size > TTL_CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value); // bound memory
    return value;
  } catch (error) {
    if (hit) return hit.value;
    throw error;
  }
}

/**
 * Tiny bounded in-memory cache (oldest entry is evicted first).
 * @template V
 * @param {number} max maximum number of entries
 */
export const createBoundedCache = (max) => {
  const store = new Map();
  return {
    /** @param {string} key @returns {V | undefined} */
    get: (key) => store.get(key),
    /** @param {string} key @param {V} value */
    set(key, value) {
      store.set(key, value);
      if (store.size > max) store.delete(store.keys().next().value);
    },
  };
};
