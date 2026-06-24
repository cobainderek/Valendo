<h1 align="center">Valendo — Frontend 🎨</h1>

<p align="center">
  Interface web do <strong>Valendo</strong>: lobby, criação de salas, duelos em tempo real,
  perfil, ranking, amigos e chat. Consome a API NestJS (REST <code>/api</code> + WebSocket).
</p>

> Visão geral do projeto e como subir o stack completo: veja o **[README da raiz](../README.md)**.

---

## 🧩 Stack

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack, output `standalone`)
- **React 19** + **TypeScript**
- **Tailwind CSS 4** + Doodle Design System (`styles/doodle-system.css`)
- **Zustand** (estado global) · **socket.io-client** (realtime)

## 📁 Estrutura

```
frontend/
├── app/                  # Rotas (App Router)
│   ├── auth/login        # login / cadastro / recuperar (botão Google se houver client id)
│   ├── lobby             # salas + ranking + temas
│   ├── room/create       # criar sala (+ upload de PDF opcional)
│   ├── room/[id]         # tela de jogo (REST + socket room:*)
│   ├── ranking, profile  # ranking semanal e perfil/histórico
│   └── dashboard, duel/[id]  # redirects
├── components/           # View (auth, lobby, room, social, profile, ui)
├── services/             # api.ts (fetch + Bearer) · socket.ts · auth.ts · ...
├── lib/store/            # useAuthStore (Zustand)
└── styles/               # doodle-system.css
```

## 🔐 Variáveis de ambiente (`.env.local`)

```env
# IMPORTANTE: NEXT_PUBLIC_API_URL DEVE terminar em /api
# (api.ts monta `${NEXT_PUBLIC_API_URL}${endpoint}`; socket.ts deriva o WS removendo o /api).
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_WS_URL=ws://localhost:3002
NEXT_PUBLIC_GOOGLE_CLIENT_ID=   # client_id público do OAuth; vazio = botão Google oculto
```

> ⚠️ As variáveis `NEXT_PUBLIC_*` são **embutidas no build** (não em runtime). Mudou alguma?
> É preciso **rebuildar**. No Docker elas vêm dos *build args* do `docker-compose.yml`.

## 🚀 Rodando

```bash
# Dev (Turbopack) → http://localhost:3000  (precisa do backend rodando)
npm install
npm run dev

# Build de produção (standalone)
npm run build && npm run start

# Lint
npm run lint
```

Com Docker (a partir desta pasta, backend já de pé):

```bash
docker compose up -d --build      # → http://localhost:3000
```

## 🔗 Como fala com o backend

- **REST:** `services/api.ts` → `fetch` com header `Authorization: Bearer <token>` (token no `localStorage`).
- **WebSocket:** `services/socket.ts` → Socket.IO em `/api/socket.io` (namespaces `/` para sala e `/chat`).

Mais detalhes de arquitetura/convenções do frontend em **[CLAUDE.md](./CLAUDE.md)**.
