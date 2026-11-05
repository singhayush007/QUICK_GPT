import { TEXT_CREDIT_COST } from "../../shared/constants/limits.js";

/**
 * Model catalogue. `tier: "free"` models are open to everyone, `tier: "pro"`
 * models need a paid plan (enforced on the server, the UI only mirrors it).
 * `chain` = Gemini model ids to try, in order. Fallbacks never cross tiers,
 * so nobody is charged Pro prices for a Flash answer.
 */
/**
 * Gemini retires model ids regularly (e.g. 2.0-flash / 2.5-pro now answer 404), so every chain can be
 * overridden from the environment without a code change:
 *   GEMINI_MODELS_LITE / GEMINI_MODELS_FLASH / GEMINI_MODELS_PRO = "model-a,model-b"
 * The `*-latest` aliases come last because they follow Google's current stable model.
 */
const chainFromEnv = (name, defaults) => {
  const list = process.env[name]?.split(",").map((m) => m.trim()).filter(Boolean);
  return list?.length ? list : defaults;
};

export const MODELS = [
  {
    id: "lite",
    name: "Lite",
    tagline: "Fastest · everyday questions",
    tier: "free",
    cost: TEXT_CREDIT_COST.lite,
    chain: chainFromEnv("GEMINI_MODELS_LITE", ["gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite"]),
  },
  {
    id: "flash",
    name: "Flash",
    tagline: "Balanced speed & quality",
    tier: "free",
    cost: TEXT_CREDIT_COST.flash,
    chain: chainFromEnv("GEMINI_MODELS_FLASH", ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-flash-latest", "gemini-3.8-flash"]),
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Most capable · deep reasoning & code",
    tier: "pro",
    cost: TEXT_CREDIT_COST.pro,
    chain: chainFromEnv("GEMINI_MODELS_PRO", ["gemini-3.1-pro-preview", "gemini-pro-latest"]),
  },
];

export const DEFAULT_MODEL = "flash";

/** Model for an id (unknown / missing ids fall back to the default). */
export const getModel = (id) =>
  MODELS.find((m) => m.id === id) || MODELS.find((m) => m.id === DEFAULT_MODEL);

/** Free models: everyone. Pro models: users with a paid plan. */
export const canUseModel = (user, model) =>
  model.tier === "free" || user?.plan === "pro";

/** Catalogue as shown to a specific user (never exposes provider ids). */
export const modelsForUser = (user) =>
  MODELS.map(({ id, name, tagline, tier, cost }) => ({
    id,
    name,
    tagline,
    tier,
    cost,
    locked: !canUseModel(user, { tier }),
  }));
