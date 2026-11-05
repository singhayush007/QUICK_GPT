# QuickGPT server

Express 5 (Node 22, ESM) + Mongoose 8 API, organised as **feature modules** with a
**service layer** (mirrors the frontend's `features/<name>` + `shared` convention).

## Layout

```
server.js            entry only: dotenv, connectDB, createApp(), listen (not on Vercel), export default app
app.js               createApp(): helmet, trust proxy, Razorpay raw-body webhook, CORS, JSON parser, modules, health, 404, error handler
config/              db, env, and lazy third-party clients (gemini, imagekit, openrouter, razorpay)
modules/
  auth/              /api/user      register, login, me        (User model, `protect` middleware)
  chat/              /api/chat      create, list, rename, pin, delete (Chat model)
  message/           /api/message   models, text, stream (SSE), image; AI provider chain, personas, model catalogue
  credits/           /api/credit    plans, purchase, verify, history (Transaction model) + /api/razorpay webhook
  share/             /api/share     public read-only chat snapshots (Share model)
  live/              /api/live      weather, AQI, markets, scores; providers/ + intent detection for chat enrichment
  voice/             /api/voice     voice catalogue + Gemini text-to-speech
  community/         /api/user/published-images  public gallery of shared images (path kept for compatibility)
shared/
  middlewares/       errorHandler, notFound, rateLimiters
  utils/             env (envSet), cache (TTL + retry + stale-if-error), wav, httpErrors (AppError)
  constants/         limits.js (prompt/TTS/share sizes, credit costs, rate limits)
```

Each module has `*.routes.js`, `*.controller.js`, `*.service.js` and (where it owns data) its Mongoose
model and `*.constants.js` files.

## Request flow

```
route (+ rate limiter, protect)  ->  controller  ->  service  ->  model / provider
```

- **Routes** wire paths to controllers and attach middleware (`protect`, rate limiters).
- **Controllers** read `req`, call one service function and shape the JSON/SSE response.
  They are the only layer that touches `req` / `res`.
- **Services** hold the business logic (atomic credit reserve/refund, history building, live-data
  enrichment, share snapshots, payment verification ...). They never see `req` / `res`; expected
  failures are thrown as `AppError(message, status, code)` and the controller decides the response.
  The SSE endpoint keeps writing to `res` in the controller and drives the service through callbacks
  (`onStart`, `onToken`, an `AbortSignal`).
- **Models** are plain Mongoose models (`User`, `Chat`, `Share`, `Transaction` — names/collections unchanged).

Cross-module calls always go through the other module's service (or model), e.g. `message.service`
uses `chat.service.findUserChat` and `live.service.enrichWithRealTimeData`.

## Environment variables

Placeholder values from `.env.example` (`your_...`) count as "not set" (`envSet`).

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string (database name `QuickGPT`) |
| `JWT_SECRET` | signs login tokens (30 days) |
| `PORT` | listen port (default 3000; ignored on Vercel) |
| `CORS_ORIGIN` | comma separated allowed frontend origins (default: allow all) |
| `GEMINI_API_KEY`, `USE_GEMINI` | primary AI provider; `USE_GEMINI=true` tries Gemini first |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_REFERRER` | fallback AI provider |
| `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` | image generation |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | payments + webhook signature |
| `CRICKET_API_KEY`, `FOOTBALL_API_KEY` | optional (live scores currently use key-less ESPN feeds) |
| `GEMINI_BASE_URL` | testing only: point Gemini calls at a mock server |
| `GEMINI_TTS_BASE_URL`, `GEMINI_TTS_MODEL` | testing / override for text-to-speech |
| `VERCEL` | set to `1` by Vercel: the server then exports the app instead of listening |

## Scripts

- `npm start` — `node server.js`
- `npm run server` — `nodemon server.js`

Deployed on Vercel via `vercel.json` (`server.js` is the serverless entry and default-exports the app).
