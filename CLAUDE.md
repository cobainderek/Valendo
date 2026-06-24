# Valendo — Stack & Arquitetura

Plataforma de gamificação de estudos com salas multiplayer em tempo real, duelos de Q&A gerados por IA.

## Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 16.2.2 (App Router, Turbopack)
- **UI**: React 19.2.4 + React DOM 19.2.4
- **Linguagem**: TypeScript 5
- **Estilização**: Tailwind CSS 4 (`@tailwindcss/postcss`)
- **Estado global**: Zustand 5
- **Realtime**: socket.io-client 4.8
- **Lint**: ESLint 9 + `eslint-config-next`
- **Path alias**: `@/*` → `./*` (definido em `tsconfig.json`)

### Backend (`/backend`)
- **Framework**: NestJS 11 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`)
- **Linguagem**: TypeScript 5.7
- **ORM**: Prisma 7.6 + `@prisma/adapter-pg` (cliente gerado em `src/generated/prisma`, formato CJS)
- **Banco**: PostgreSQL 8.20 (driver `pg`)
- **Cache/PubSub**: Redis (ioredis 5.10)
- **Realtime**: Socket.IO 4.8 (`@nestjs/websockets`, `@nestjs/platform-socket.io`)
- **Auth**: JWT (`@nestjs/jwt`) + Passport (`passport-jwt`, `@nestjs/passport`)
- **Hash**: bcrypt 6
- **Validação**: `class-validator` + `class-transformer` (com `ValidationPipe` global, `whitelist: true`)
- **IA**: Google Gemini (`@google/genai` 1.50)
- **PDF**: `pdf-parse` 2.4 (upload de material para gerar perguntas)
- **Testes**: Jest 30 + Supertest 7 (e2e em `test/jest-e2e.json`)

## Arquitetura

### Backend — módulos NestJS (`/backend/src`)
- `auth/` — login email+senha, login Google (ID Token), JWT strategy; DTOs `login.dto.ts`, `google-login.dto.ts`, `recover.dto.ts`; `@Throttle` anti-brute-force em login/google
- `users/` — CRUD de usuários (bcrypt rounds 12)
- `rooms/` — gestão de salas (criar/entrar, host, status `waiting/playing/finished`, código 6 chars, modo solo c/ bot); DTOs `create-room.dto.ts`, `update-room.dto.ts`, `submit-answer.dto.ts`; `rooms.gateway.ts` (Socket.IO, namespace raiz)
- `questions/` — geração de perguntas via Gemini (prompt em `prompts/system-instruction.txt`); upload de PDF com limite de 5MB + `fileFilter` e throttle dedicado
- `friends/` — amizades e pedidos
- `ranking/` — ranking semanal (`weekly_scores`)
- `chat/` — conversas/DM/grupos (`@Controller('conversations')` → `/api/conversations/*`) + `chat.gateway.ts` (namespace `/chat`, presença em memória)
- `prisma/` — `PrismaService`
- `common/middleware/` — middlewares compartilhados
- `main.ts` — bootstrap; `helmet`, CORS por **allowlist** (`CORS_ORIGINS`), `BigInt.prototype.toJSON` patchado, `ValidationPipe` global, `trust proxy 1`, Swagger só em dev (`/api/docs`), prefixo global `/api`, porta padrão `3001` (env `PORT`), host `127.0.0.1` (env `API_HOST`), rate limit global via `@nestjs/throttler`

### Modelos Prisma (`/backend/prisma/schema.prisma`) — 11 models
- **User** (`users`): id, name, tag (único), email (único), passwordHash, globalXp, role
- **Room** (`rooms`): id, code (6 chars, único), hostId, theme, status (`waiting` default), isPrivate, isSoloMode, maxPlayers, questionTime, numQuestions, startedAt, finishedAt, winnerId; 1:1 com Duel
- **RoomPlayer** (`room_players`): jogador na sala (userId, score, correct, finished, isBot, botName); unique `[roomId, userId, isBot]`
- **Duel** (`duels`): id, roomId (único), createdAt, totalRounds; tem várias Question
- **Question** (`questions`): id, duelId, text, options (JSON), correctAnswer, explanationAi
- **Answer** (`answers`): userId, questionId, selectedAnswer, isCorrect; unique `[userId, questionId]`
- **WeeklyScore** (`weekly_scores`): userId, year, week, xp; unique `[userId, year, week]`
- **Friendship** (`friendships`): requesterId, addresseeId, status; unique `[requesterId, addresseeId]`
- **Conversation** (`conversations`), **ConversationMember** (`conversation_members`), **Message** (`messages`): chat (DM/grupos, mensagens com cursor BigInt)

### Frontend — App Router (`/frontend/app`)
Rotas:
- `/` — landing/lobby
- `auth/` — login/registro
- `dashboard/`
- `lobby/`
- `room/`, `room/[id]`, `room/create`
- `duel/[id]` — tela de duelo
- `profile/`
- `ranking/`

### Componentes (`/frontend/components`)
- `auth/` — formulários
- `lobby/` — `LobbyComponents.tsx`
- `room/` — `MatchmakingSplit`, `PlayerSideCard`, `DicasCarousel`
- `social/` — `FloatingFriendsPanel`, `FriendsChatPanel` (chat em tempo real), `GlobalFloatingUI` (montado no `layout.tsx`)
- `profile/` — `UserProfile`
- `ui/` — primitivas (`Valdo` mascote, etc.)

### Camadas (`/frontend`)
- `services/api.ts` — wrapper de `fetch` com token Bearer; URL via `NEXT_PUBLIC_API_URL` (**DEVE terminar em `/api`**; default `https://dyotech.shop/api`). `services/socket.ts` deriva a origem do WS removendo o `/api` (path `/api/socket.io`)
- `services/auth.ts` — login/logout
- `lib/store/useAuthStore.ts` — store Zustand de auth
- `lib/salas.ts`, `lib/temas.ts` — helpers de domínio
- `styles/doodle-system.css` — sistema visual customizado

## Variáveis de ambiente (backend)

```env
# 5433/6380 = portas publicadas no HOST pelo docker-compose; dentro do container
# o compose injeta postgres:5432 / redis:6379. NÃO usar 5432/6379 no host (colidem
# com containers de outros projetos).
DATABASE_URL="postgresql://user:password@localhost:5433/valendo?schema=public"
REDIS_URL="redis://localhost:6380"
PORT=3001
JWT_SECRET="sua-chave-secreta-aqui"   # OBRIGATÓRIA — fail-fast no main.ts (sem fallback)
GEMINI_API_KEY="..."                   # Google GenAI
# Opcionais:
# API_HOST (default 127.0.0.1)
# CORS_ORIGINS (default https://dyotech.shop,https://www.dyotech.shop,http://localhost:3000)
# GOOGLE_CLIENT_ID (login Google; ausente -> /auth/google responde 503)
```

## Comandos

### Backend
```bash
npm install
npx prisma generate          # gera client em src/generated/prisma
npx prisma migrate dev       # aplica migrations
npm run start:dev            # dev com watch
npm run test                 # unit
npm run test:e2e             # e2e
```

### Frontend
```bash
npm install
npm run dev                  # Next dev (Turbopack)
npm run build
npm run lint
```

## Convenções importantes

- **BigInt**: o backend serializa `BigInt` como string globalmente (patch em `main.ts`). IDs do Prisma vêm como `BigInt` — sempre converter para string ao retornar via API/socket.
- **CORS por allowlist** (`CORS_ORIGINS`, default `dyotech.shop` + `localhost:3000`) com `credentials:true` — **não** é "qualquer origem". Headers de segurança via `helmet`.
- **Rate limiting** global via `@nestjs/throttler` (100/min por IP); `/auth/login` e `/auth/google` (5/min) e `/questions/generate` (10/min) mais restritos.
- **Swagger/OpenAPI** disponível **só fora de produção** em `/api/docs` (gate por `NODE_ENV`).
- **ValidationPipe** com `whitelist: true` — DTOs precisam ter `class-validator` decorators ou os campos são removidos.
- **Path alias `@/`** no frontend resolve para a raiz de `frontend/` (configurado em `tsconfig.json`).
- **Prisma client** é gerado em `src/generated/prisma` com `moduleFormat: cjs` — não importar de `@prisma/client`, e sim do path gerado.
- **Migrations**: há 9 migrations versionadas em `backend/prisma/migrations` (`prisma migrate deploy` em prod). Testes e2e exigem `NODE_OPTIONS=--experimental-vm-modules` (Prisma 7 usa `import()` dinâmico) e o `moduleNameMapper` já presente em `test/jest-e2e.json`.

## Estado dos commits do usuário (referência)

- `9c790ac` — feat: tela de matchmaking, transição VS/FIGHT, criação de aba de amigos e chat
- `d4ec147` — feat: tela de matchmaking, transição VS/FIGHT e painel de amigos global
- `37b8fe6` — `new` (último commit estável antes do trabalho de matchmaking)

Trabalho recente do dono do repo (cobainderek): rotas `duel/[id]`, `room/[id]`, componentes `MatchmakingSplit`, `PlayerSideCard`, `DicasCarousel`, painel social completo (`FloatingFriendsPanel`, `FriendsChatPanel`, `GlobalFloatingUI`), montados no `app/layout.tsx`.
