<h1 align="center">Valendo 🎲</h1>

<p align="center">
  <strong>Plataforma de gamificação de estudos.</strong> Salas multiplayer em tempo real,
  duelos de perguntas e respostas geradas por IA (Google Gemini) a partir de um tema ou de um PDF.
</p>

---

## 🧩 Stack

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** (`/frontend`) | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Zustand · socket.io-client |
| **Backend** (`/backend`) | NestJS 11 · Prisma 7 + PostgreSQL · Redis (ioredis) · Socket.IO · JWT + Passport · bcrypt · class-validator · Google Gemini (`@google/genai`) · pdf-parse |
| **Infra** | Docker Compose (Postgres + Redis + apps) · Nginx (TLS/proxy em produção) |

## 📁 Estrutura do monorepo

```
Valendo/
├── backend/    # API NestJS (REST /api + WebSocket) — ver backend/README.md
├── frontend/   # App Next.js — ver frontend/README.md
├── Docs/       # DER, coleções Postman/Insomnia, OpenAPI (yaml), SQL, mini-mundo
├── teste/      # Scripts de smoke/e2e (valendo-rotas.http, robo-testes.js, *-smoke.mjs)
├── CLAUDE.md   # Arquitetura detalhada (módulos, models, convenções)
├── DEPLOY.md   # Checklist de deploy em produção (dyotech.shop)
└── RELATORIO-VARREDURA.md  # Relatório de auditoria do projeto
```

## 🚀 Rodando localmente (Docker — recomendado)

O backend sobe primeiro: ele cria a rede `backend_default`, reusada pelo frontend.

```bash
# 1. Backend (Postgres + Redis + API)
cd backend
docker compose up -d --build

# 2. Frontend
cd ../frontend
docker compose up -d --build
```

Serviços expostos no host:

| Serviço | URL / porta |
|---------|-------------|
| Frontend | http://localhost:3000 |
| API (REST) | http://localhost:3002/api |
| Swagger (só em dev) | http://localhost:3002/api/docs |
| PostgreSQL | localhost:5433 |
| Redis | localhost:6380 |

> **Testando de outros dispositivos na LAN:** as URLs `NEXT_PUBLIC_*` são embutidas em
> *build time*. Rebuilde o frontend passando o IP do host, por exemplo:
> `NEXT_PUBLIC_API_URL=http://<ip-da-lan>:3002/api docker compose up -d --build`.

### Sem Docker (dev direto)

```bash
# backend → http://localhost:3001
cd backend && npm install && npx prisma migrate dev && npm run start:dev
# frontend → http://localhost:3000
cd frontend && npm install && npm run dev
```

## 🔐 Variáveis de ambiente

- **Backend** (`backend/.env`): `JWT_SECRET` (obrigatória — *fail-fast*), `DATABASE_URL`,
  `REDIS_URL`, `GEMINI_API_KEY`, opcionais `PORT`, `API_HOST`, `CORS_ORIGINS`, `GOOGLE_CLIENT_ID`.
- **Frontend** (`frontend/.env.local`): `NEXT_PUBLIC_API_URL` (**deve terminar em `/api`**),
  `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (vazio = botão Google oculto).

Detalhes e portas host × container em **[CLAUDE.md](./CLAUDE.md)** e **[DEPLOY.md](./DEPLOY.md)**.

## 📚 Documentação

- **[CLAUDE.md](./CLAUDE.md)** — arquitetura: módulos NestJS, 11 models Prisma, eventos WebSocket, convenções.
- **[DEPLOY.md](./DEPLOY.md)** — checklist de deploy em produção.
- **[Docs/](./Docs/)** — DER do banco, coleções Postman/Insomnia, `Valendo_Swagger_API_Docs.yaml`, `Valendo.sql`.
- **Swagger ao vivo** — `/api/docs` (apenas fora de produção).

## 🧪 Testes

```bash
cd backend
npm test                                   # unitários (28/28)

# bateria e2e de todas as rotas (com a infra Docker de pé):
DATABASE_URL="postgresql://user:password@localhost:5433/valendo?schema=public" \
REDIS_URL="redis://localhost:6380" NODE_OPTIONS=--experimental-vm-modules \
npm run test:e2e -- all-routes.e2e-spec.ts --runInBand --forceExit
```

Scripts manuais de smoke (REST/WebSocket) ficam em **[`teste/`](./teste/)**.

## ✨ Funcionalidades

- Autenticação por e-mail/senha (JWT) e **login com Google** (ID Token / GIS).
- Salas públicas/privadas por código de 6 caracteres, modo solo contra bot.
- Geração de perguntas via **Gemini** a partir de tema ou **upload de PDF**, com cache no Redis.
- Duelos 1v1/multiplayer em tempo real (placar ao vivo, retomada após reload).
- Amigos, chat (DM/grupos) com presença, e ranking semanal de XP.

## 👥 Equipe

**Desenvolvedores**
- **Derek** — Frontend — [@cobainderek](https://github.com/cobainderek)
- **Dyone** — Backend — [@DyoneNunes](https://github.com/DyoneNunes)

**Orientador**
- Otavio Lube

<sub>Projeto acadêmico — FAESA · Desenvolvimento Web 2 (2026).</sub>

---

<p align="center"><em>Monorepo Valendo — backend NestJS + frontend Next.js.</em></p>
