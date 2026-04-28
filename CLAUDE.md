# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo with two deployable apps plus shared docs:

- `backend/` — NestJS 11 + Prisma 7 + PostgreSQL + Redis + Google Gemini. Default port `3001`.
- `frontend/` — Next.js 16 (App Router) + React 19 + Tailwind 4 + Zustand + Socket.io client. Default port `3000`. Has its own detailed `frontend/CLAUDE.md` — read it when working on UI.
- `Docs/` — Reference material: `Developer_Integration_Guide.md`, `Valendo_Swagger_API_Docs.yaml`, `Valendo.sql`, Postman/Insomnia collections, ER diagram.
- `teste/` — Manual + automated API smoke tests (`valendo-rotas.http` for VS Code REST Client, `robo-testes.js` for Node CLI).

There is no top-level package — each app has its own `package.json`. Always `cd` into `backend/` or `frontend/` before running npm scripts.

## Common commands

### Backend (`cd backend`)

| Command | Purpose |
|---|---|
| `npm run start:dev` | Hot-reload dev server on `:3001` |
| `npm run start:debug` | Same with `--inspect` |
| `npm run build && npm run start:prod` | Production build + run from `dist/main` |
| `npm run lint` | ESLint with `--fix` |
| `npm run format` | Prettier on `src/**` and `test/**` |
| `npm test` | Jest unit tests (matches `*.spec.ts` under `src/`) |
| `npm run test:watch` | Jest watch mode |
| `npm run test:cov` | Coverage |
| `npm run test:e2e` | Jest with `test/jest-e2e.json` |
| `npx prisma db push` | Sync schema → DB without migration files |
| `npx prisma migrate dev --name <name>` | Create + apply migration |
| `npx prisma generate` | **Required after every schema change** — regenerates client to `src/generated/prisma` (cjs); skipping it produces TypeScript type failures |
| `npx prisma studio` | DB GUI on `:5555` |
| `docker compose up -d postgres redis` | Spin up just the local DBs (compose file at `backend/docker-compose.yml`) |
| `docker compose up` | Spin up backend + Postgres + Redis together |

Run a single backend test: `npm test -- path/to/file.spec.ts` or `npm test -- -t "test name pattern"`.

### Frontend (`cd frontend`)

| Command | Purpose |
|---|---|
| `npm run dev` | Next dev server on `:3000` |
| `npm run build` | Production build |
| `npm start` | Run built app |
| `npm run lint` | ESLint (next config) |

### E2E smoke (`cd teste`)

- `node ./robo-testes.js` — boots through health → register → create room → upload PDF / generate questions, verifying the Gemini+Redis pipeline.
- Open `valendo-rotas.http` in VS Code with REST Client to fire individual requests.

## Architecture

### Backend (NestJS, MVC by feature module)

`src/main.ts` enables global `ValidationPipe({ whitelist: true })` and CORS, then listens on `process.env.PORT ?? 3001` bound to `API_HOST ?? '0.0.0.0'`. A global hack patches `BigInt.prototype.toJSON` because Prisma uses `BigInt` for every primary key — keep that workaround in mind whenever serializing entities.

`AppModule` wires feature modules: `users`, `auth`, `rooms`, `questions`, `answers`, `ranking`, plus `prisma` (shared `PrismaService`). A global `LoggerMiddleware` is applied to all routes.

Each feature follows the same shape: `*.module.ts` / `*.controller.ts` / `*.service.ts` / `dto/`. Controllers stay thin; services own DB access via `PrismaService` and external integrations.

**Auth.** JWT via `@nestjs/passport` + `passport-jwt`. Protected routes use `@UseGuards(AuthGuard('jwt'))` and read `req.user.id`, which must be cast with `BigInt(req.user.id)` before any Prisma query (the User PK is BigInt). `users` exposes registration; `auth` exposes login only.

**Rooms.** REST + room-code-based join flow. Routes: `POST /rooms`, `GET /rooms`, `GET /rooms/:code`, `POST /rooms/:code/join`, `POST /rooms/:code/start`, `POST /rooms/:code/answer`. The room owns a 1:1 `Duel`, which owns the `Question` rows.

**Questions / Gemini pipeline (`questions.service.ts`).** This is the most non-obvious flow:
1. Validate that the requester is the room's host.
2. Build `baseContext` from either an uploaded PDF (multipart `file`, parsed by `pdf-parse`) or `dto.theme`. Text is sanitized to strip control chars and collapse whitespace.
3. If theme-based, derive `cacheKey = valendo:quiz:<md5(text)>` and try Redis (`ioredis`, TTL 7 days = 604800s). PDF inputs are *not* cached (no stable key).
4. On miss, call `gemini-2.5-flash` via `@google/genai` with the system prompt loaded once from `src/questions/prompts/system-instruction.txt` and a strict `responseSchema` (10 questions, 4 options each, `correctAnswer` must equal one of the options, plus `explanationAi`). Up to 2 attempts.
5. Persist questions under the room's `Duel` (creating it if absent; otherwise *adds* to `totalRounds`).
6. Redis failures are swallowed silently and the code falls back to Gemini — the docs call this "Zero-Crash Experience". Don't add hard errors there.

**Database.** Prisma client is generated to `src/generated/prisma` with `moduleFormat = "cjs"` (configured in `schema.prisma`). The generator block points away from the default `node_modules/@prisma/client` location, so import the client from the generated path used by `PrismaService`. Models use `@@map` snake_case table names with camelCase fields. Key relationships: `User` → `Room` (host/winner) → `RoomPlayer` (with `isBot` support) → `Duel` (1:1 with Room) → `Question` → `Answer`. `WeeklyScore` powers `/ranking/weekly`.

### Frontend (Next.js 16 App Router)

`frontend/CLAUDE.md` is the source of truth — it covers the strict layered convention (`app/` = controller/orchestration, `components/` = pure view, `services/` = fetch layer, `lib/store/` = Zustand). The hard rule is: **components in `components/` never import from `services/`**; the `page.tsx` is the only bridge.

`frontend/AGENTS.md` warns: this is Next.js 16, which has breaking API changes from older training data. When editing Next-specific code (routing, server actions, fetch caching, metadata, etc.), consult `node_modules/next/dist/docs/` rather than relying on memory.

Code style for the frontend uses Portuguese identifiers (`handleLogin`, `setApelido`, `carregando`) and Conventional Commits in Portuguese (`feat: adiciona tela de ranking`).

## Environment

Backend (`backend/.env`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/valendo?schema=public"
PORT=3001
API_HOST="0.0.0.0"
JWT_SECRET="..."
GEMINI_API_KEY="..."
REDIS_URL="redis://localhost:6379"
```

Frontend (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

The `.env.example` and `Docs/Developer_Integration_Guide.md` reference port `3000` for backend in older notes, but the current `main.ts` and `docker-compose.yml` use `3001`. Trust the code.

## Gotchas

- After editing `prisma/schema.prisma`, run `npx prisma generate` *and* push/migrate, otherwise types in services drift silently.
- All Prisma IDs are `BigInt`. Convert `req.user.id` (string from JWT) with `BigInt(...)` before queries; rely on the `BigInt.toJSON` patch in `main.ts` for responses.
- Redis is treated as best-effort. New code paths that need Redis must keep the silent-fallback pattern — don't surface 500s when Redis is down.
- PDF question generation skips the cache by design (no deterministic key). Don't add a content-hash cache for PDFs without verifying token economics.
- The frontend prototype folder `valendoteste/` (referenced in `frontend/CLAUDE.md`) is reference-only — never import from it.
