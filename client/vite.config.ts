import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Split big third-party groups into their own long-lived chunks. */
function vendorChunk(id: string): string | undefined {
  if (!id.includes("node_modules")) return undefined;
  if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return "vendor-react";
  if (/node_modules\/(react-markdown|remark-[^/]+|rehype-[^/]+|unified|micromark[^/]*|mdast-[^/]+|hast-[^/]+|unist-[^/]+|vfile[^/]*|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|character-entities[^/]*|trim-lines|trough|bail|is-plain-obj|devlop|html-url-attributes|estree-util-[^/]+|ccount|markdown-table|zwitch|longest-streak)\//.test(id))
    return "vendor-markdown";
  if (/node_modules\/(@tanstack|zustand|axios)\//.test(id)) return "vendor-data";
  return undefined;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  build: {
    rollupOptions: { output: { manualChunks: vendorChunk } },
  },
});
