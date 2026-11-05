import axios from "axios";

/** Shared HTTP client for the key-less public data providers. */
export const http = axios.create({
  timeout: 10000,
  headers: { "User-Agent": "QuickGPT/2.0" },
});
