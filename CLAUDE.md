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
- `auth/` — login, JWT strategy, DTOs (`login.dto.ts`)
- `users/` — CRUD de usuários
- `rooms/` — gestão de salas (criar/entrar, host, status `waiting/...`, código de 6 chars), DTOs `create-room.dto.ts`, `update-room.dto.ts`
- `questions/` — geração de perguntas via Gemini (prompt em `prompts/system-instruction.txt`)
- `prisma/` — `PrismaService`
- `common/middleware/` — middlewares compartilhados
- `main.ts` — bootstrap, CORS habilitado, `BigInt.prototype.toJSON` patchado, porta padrão `3000` (sobrescrevível com `PORT`)

### Modelos Prisma (`/backend/prisma/schema.prisma`)
- **User** (`users`): id, name, tag (único), email (único), passwordHash, globalXp; FK `HostedRooms` → Room
- **Room** (`rooms`): id, code (6 chars, único), hostId, theme, status (default `waiting`), isPrivate; relação 1:1 com Duel
- **Duel** (`duels`): id, roomId (único), createdAt, totalRounds; tem várias Question
- **Question** (`questions`): id, duelId, text, options (JSON), correctAnswer, explanationAi

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
- `services/api.ts` — wrapper de `fetch` com token Bearer; URL via `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`)
- `services/auth.ts` — login/logout
- `lib/store/useAuthStore.ts` — store Zustand de auth
- `lib/salas.ts`, `lib/temas.ts` — helpers de domínio
- `styles/doodle-system.css` — sistema visual customizado

## Variáveis de ambiente (backend)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/valendo?schema=public"
PORT=3000
JWT_SECRET="sua-chave-secreta-aqui"
# Adicionalmente esperados:
# API_HOST (default 0.0.0.0)
# REDIS_URL ou config para ioredis
# GEMINI_API_KEY (Google GenAI)
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
- **CORS habilitado** para qualquer origem (`app.enableCors()` em `main.ts`).
- **ValidationPipe** com `whitelist: true` — DTOs precisam ter `class-validator` decorators ou os campos são removidos.
- **Path alias `@/`** no frontend resolve para a raiz de `frontend/` (configurado em `tsconfig.json`).
- **Prisma client** é gerado em `src/generated/prisma` com `moduleFormat: cjs` — não importar de `@prisma/client`, e sim do path gerado.

## Estado dos commits do usuário (referência)

- `9c790ac` — feat: tela de matchmaking, transição VS/FIGHT, criação de aba de amigos e chat
- `d4ec147` — feat: tela de matchmaking, transição VS/FIGHT e painel de amigos global
- `37b8fe6` — `new` (último commit estável antes do trabalho de matchmaking)

Trabalho recente do dono do repo (cobainderek): rotas `duel/[id]`, `room/[id]`, componentes `MatchmakingSplit`, `PlayerSideCard`, `DicasCarousel`, painel social completo (`FloatingFriendsPanel`, `FriendsChatPanel`, `GlobalFloatingUI`), montados no `app/layout.tsx`.
