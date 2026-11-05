import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

/**
 * Architecture boundaries (see CLAUDE.md):
 *   app  ->  features  ->  store  ->  shared(api/constants/types/utils/services)
 * - shared never imports features/app; its low-level folders never import the store either
 * - store never imports features/app
 * - features never import `app`, and only import each other along the explicit edges below
 *   (chat composes share + voice, sidebar uses auth's logout hook) — no cycles.
 */
const FEATURES = ["auth", "chat", "community", "credits", "live", "share", "sidebar", "voice"];
const ALLOWED_FEATURE_EDGES = { chat: ["share", "voice"], sidebar: ["auth"] };

const restrict = (group, message) => ["error", { patterns: [{ group, message }] }];

const boundaryRules = [
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": restrict(["@/features/*", "@/app/*"], "shared/ must not depend on features/ or app/.") },
  },
  {
    files: ["src/shared/{api,constants,types,utils,services,lib}/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict(["@/features/*", "@/app/*", "@/store/*"], "Low-level shared code must not depend on the store, features or app."),
    },
  },
  {
    files: ["src/store/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": restrict(["@/features/*", "@/app/*"], "store/ may only depend on shared/ (move the service into shared/services).") },
  },
  ...FEATURES.map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": restrict(
        [
          "@/app/*",
          ...FEATURES.filter((other) => other !== feature && !(ALLOWED_FEATURE_EDGES[feature] ?? []).includes(other)).map((other) => `@/features/${other}/*`),
        ],
        `features/${feature} may not import other features (allowed: ${(ALLOWED_FEATURE_EDGES[feature] ?? []).join(", ") || "none"}). Move shared code into shared/.`,
      ),
    },
  })),
];

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, reactHooks.configs["recommended-latest"], reactRefresh.configs.vite],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    rules: {
      // Components/hooks/stores legitimately export helpers next to the main export in a few files.
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  ...boundaryRules,
]);
