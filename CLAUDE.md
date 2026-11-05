# QuickGPT — conventions

File naming is **PascalCase** and the file name is **the main thing the file exports** — this applies to both
components and hooks:

- Components / views: `ChatPage.tsx` exports `ChatPage`, `ModelPicker.tsx` exports `ModelPicker`.
- Hooks: `UseChatSender.ts` exports `useChatSender` (same rule as the Exaltride codebase: PascalCase file, `use…` export).
- Everything else uses a suffix that says what it is: `chat.service.ts`, `chat.types.ts`, `chat.constants.ts`,
  `format.utils.ts`, `chatStore.ts` (zustand stores live in `src/store/`).

## Client architecture (`client/src`)

```
app/                 App shell only: App.tsx (what to show), layout/AppShell.tsx, providers/AppProviders.tsx
features/<name>/     One folder per product feature
  views/             Page components (what a route renders)
  components/        Feature-private UI
  hooks/             Feature hooks (TanStack Query, state machines, effects)
  services/          axios calls — the ONLY place that knows endpoint paths
  constants/ types/ util/
shared/              Used by 2+ features: api/, components/ui/, constants/, hooks/, lib/, types/, utils/
store/               Cross-feature zustand stores (auth, chat, preferences, theme)
```

Dependency direction (enforced by ESLint `no-restricted-imports` in `client/eslint.config.js`):

```
app  ->  features  ->  store  ->  shared (api / constants / types / utils / services)
```

- `shared/` never imports `features/` or `app/`; `shared/{api,constants,types,utils,services,lib}` never import the store.
- `store/` only depends on `shared/` — services a store needs live in `shared/services/`.
- Features import each other only along the allowed edges (`chat -> share, voice`, `sidebar -> auth`).
  Code needed by two features moves to `shared/` (that is why `Message`, the speech engine and the auth/chat/voice
  services live there).

Rules of thumb:

- Pages stay thin: route -> `views/XPage.tsx` -> components + hooks. Business logic goes in hooks/services/stores.
- Server data -> TanStack Query (`useQuery`) in a feature hook. Client state -> zustand store.
- Components never call axios directly; they use a hook or a store action that calls a `*.service.ts`.
- Endpoint paths live only in `shared/constants/apiPaths.constants.ts`; localStorage keys only in
  `shared/constants/storage.constants.ts`.
- Import across the app with the `@/` alias (`@/shared/...`, `@/features/...`, `@/store/...`).
- TypeScript is `strict`; run `npm run typecheck` (also part of `npm run build`).
- Pure logic gets a Vitest test next to it (`*.test.ts`); run `npm test`.

## Server architecture (`server`)

Feature modules under `server/modules/<feature>/` with `routes -> controller -> service -> model`; cross-cutting code
(rate limiters, error handler, env helpers, constants) in `server/shared/`; third-party clients in `server/config/`.
See `server/README.md`. Tests live in `server/tests/` (`npm test`, built-in `node:test`, no database needed).
A new module = `routes`, `controller`, `service` (+ model / constants) and a line in `server/app.js`.
