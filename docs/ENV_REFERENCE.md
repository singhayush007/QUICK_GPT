# Environment reference

Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`, then fill in the values.
**Never commit real secrets** (`.env` files are git-ignored).

Values that still look like placeholders (`your_…`) are treated as **not configured**: the matching feature is
disabled with a clear message instead of calling the provider with fake credentials.

## Server (`server/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | no (3000) | HTTP port |
| `MONGODB_URI` | **yes** | MongoDB connection string (database name `QuickGPT` is set in code). Special characters in the password must be URL-encoded (`@` → `%40`). |
| `JWT_SECRET` | **yes** | Signs session tokens |
| `GEMINI_API_KEY` | **yes** (or OpenRouter) | Chat, streaming and premium voices (Gemini TTS) |
| `USE_GEMINI` | no | `true` = try Gemini first, falling back to OpenRouter |
| `GEMINI_TTS_MODEL` | no | Override the text-to-speech model |
| `GEMINI_MODELS_LITE`, `GEMINI_MODELS_FLASH`, `GEMINI_MODELS_PRO` | no | Comma-separated Gemini model ids to try (in order) for each tier. Google retires models often — if chat suddenly answers "models are no longer available", update these (list yours with `GET /v1beta/models`). |
| `GEMINI_BASE_URL` / `GEMINI_TTS_BASE_URL` | no | Point at a mock/proxy (tests) |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_REFERRER` | no | Fallback chat provider |
| `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` | for images | AI image generation |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | for payments | Credit purchases |
| `CRICKET_API_KEY`, `FOOTBALL_API_KEY` | no | Legacy keys; live scores use free ESPN feeds |
| `CORS_ORIGIN` | no | Comma-separated allowed origins (default: all) |

## Client (`client/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SERVER_URL` | no (`http://localhost:3000`) | API base URL of the deployed server, e.g. `https://your-api.vercel.app`. A trailing slash is stripped automatically. |
| `VITE_RAZORPAY_KEY_ID` | no | Fallback public key for the checkout widget. The server already sends the key id with every order (so a missing value here no longer breaks payments). |
