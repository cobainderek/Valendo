# VALENDO

Plataforma web de gamificação para estudos. Usuários criam salas e disputam perguntas e respostas em tempo real. Temas gerados via upload de PDF + Google Gemini.

**Equipe:** Derek (frontend) · Dyone (backend)
**Disciplina:** Desenvolvimento Web 2 — FAESA 2025
**Assistente:** Claude (pair programming com Derek no frontend)

## Stack

- **Frontend:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 + Doodle Design System · Zustand · Socket.io client
- **Backend:** NestJS · Prisma · PostgreSQL · JWT + bcrypt · Socket.io · Google Gemini 1.5 Pro
- **Infra:** Docker (PostgreSQL local) · Vercel (frontend) · Railway (backend)

## Commands

- `cd frontend && npm run dev` → localhost:3000
- `cd backend && npm run start:dev` → localhost:3001
- `npx prisma studio` → localhost:5555 (visual do banco)
- `npx prisma migrate dev --name <nome>` → aplicar migração
- `docker start valendo-db` → iniciar PostgreSQL

## Architecture — MVC

Padrão MVC. Frontend = View. Backend = Model + Controller.

### Separação no frontend:

| Camada | Pasta | Responsabilidade |
|--------|-------|-----------------|
| Controller | `app/` | Rotas, composição de page, conecta View ↔ Model |
| View | `components/` | Só visual, recebe props, emite eventos |
| Model | `services/` | Fetch calls pro backend, parsing de response |
| State | `lib/store/` | Estado global via Zustand |

**Regra**: componentes em `components/` NUNCA importam de `services/`. Quem faz a ponte é o `page.tsx`.

```
frontend/
├── app/                          # CONTROLLER (rotas + orquestração)
│   ├── auth/login/page.tsx       # ✅ Implementado
│   ├── auth/register/page.tsx    # 🔲 Falta implementar
│   ├── lobby/page.tsx            # ✅ Implementado
│   ├── dashboard/page.tsx        # 🔲 Vazio
│   ├── duel/                     # 🔲 Vazio
│   ├── room/                     # 🔲 Vazio
│   ├── ranking/                  # 🔲 Vazio
│   ├── profile/                  # 🔲 Vazio
│   ├── layout.tsx                # ✅ Fonts Nunito + Caveat
│   ├── globals.css               # ✅ Tailwind + Doodle System
│   └── page.tsx                  # ✅ Redirect → /auth/login
│
├── components/                   # VIEW (componentes visuais puros)
│   ├── ui/                       # Primitivos reutilizáveis
│   │   ├── Valdo.tsx             # ✅ Mascote coruja (5 expressões, 3 acessórios)
│   │   ├── DoodleIcon.tsx        # ✅ 16 ícones SVG doodle
│   │   ├── Doodle.tsx            # ✅ Decorações flutuantes (star, spark, etc.)
│   │   └── LogoMark.tsx          # ✅ Logo SVG
│   ├── auth/
│   │   ├── LoginForm.tsx         # ✅ Form login/signup/recover
│   │   └── LoginScene.tsx        # ✅ Cenário direito com Valdo
│   └── lobby/
│       ├── Sidebar.tsx           # ✅ Sidebar com perfil e nav
│       └── LobbyComponents.tsx   # ✅ TemaGrid, HeroCreateRoom, LiveDuels, RankingCard
│
├── services/                     # MODEL (comunicação com backend)
│   ├── api.ts                    # ✅ Fetch base com auth
│   └── auth.ts                   # ✅ login(), register(), recoverPassword()
│
├── lib/
│   ├── temas.ts                  # ✅ Dados de temas (futuro: vem da API)
│   └── store/
│       └── useAuthStore.ts       # ✅ Zustand (token, login state)
│
├── styles/
│   └── doodle-system.css         # ✅ CSS do visual doodle (cards, botões, inputs)
│
└── valendoteste/                 # 📦 Protótipos de referência (NÃO usar em produção)
```

## CSS Strategy

**Opção A: Tailwind + Custom CSS**

- **Tailwind** = layout e espaçamento (flex, grid, gap, p-4, responsividade)
- **doodle-system.css** = identidade visual (cards 3D, botões doodle, sombras sólidas, borders grossas)
- Classes doodle: `.doodle-card`, `.btn`, `.btn-accent`, `.btn-primary`, `.input`, `.sticker`, `.chip`, `.link-hand`, `.hand-divider`, `.scribble`

## Code Style

- TypeScript strict, evitar `any`
- Componentes React como function components com hooks
- Variáveis e funções em português (ex: `handleLogin`, `setApelido`, `carregando`)
- Lógica de fetch em `services/`, nunca direto no componente
- Commits: Conventional Commits em português (`feat: adiciona tela de ranking`)

## Design Tokens — Paleta

```
primary:      #1B4FBE    (azul principal)
primary-dark: #0D3080    (azul escuro)
primary-soft: #D9E6FF    (azul claro)
bg-page:      #EEF3FB    (fundo azul gelo)
bg-card:      #FFFFFF    (fundo de cards)
bg-cream:     #FFF8E7    (fundo creme)
border:       #C8D8F0    (bordas)
ink:          #1A1A2E    (preto principal — contornos, textos)
muted:        #6B7BA8    (texto secundário)
accent:       #F5C518    (amarelo destaque — CTAs)
orange:       #E8601C    (ação secundária)
green:        #2ECC71    (acerto)
red:          #E74C3C    (erro)
purple:       #7C3AED
pink:         #DB2777
```

## Visual Identity

Flat Design 2D com contornos pretos finos. Sombra sólida inferior 3D flat (`box-shadow: 4px 4px 0`). Fontes: Nunito (UI) + Caveat (hand-written). Background com doodles SVG.

**Mascote Valdo**: Coruja acadêmica com óculos. SVG puro, 5 expressões (idle, cheer, think, confused, sleep), 3 acessórios (book, trophy, pencil). Componente em `components/ui/Valdo.tsx`.

## Game Modes

- **PvP (core):** 1v1 ou multiplayer. Salas públicas ou privadas (código). Perguntas sincronizadas em tempo real.
- **PvE (secundário):** Solo contra IA, modo prática, sem ranking.

## WebSocket Events

```
Cliente → Servidor:  ready | answer
Servidor → Cliente:  duel:start | question:new | player:answered | question:result | duel:finished | player:disconnected
```

## Scoring

| Ação                 | Pontos     |
|----------------------|------------|
| Concluir duelo       | +20        |
| Vencer PvP           | +50        |
| Acerto perfeito      | +40 bônus  |
| Streak 5+ acertos    | +5/questão |
| Primeiro duelo do dia| +15        |
| Tema da semana       | x2         |

## Environment Variables

```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/valendo
GEMINI_API_KEY=<key>
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Important Notes

- NEVER commit `.env` files
- Frontend NÃO acessa banco. Toda comunicação via API REST ou WebSocket.
- Upload de PDF vai via POST multipart pro backend, que extrai texto e envia ao Gemini.
- Protótipos em `valendoteste/` são referência visual — NÃO usar em produção. Os componentes reais estão em `components/`.

## Próximos Passos

1. 🔲 Register page
2. 🔲 Tela de duelo em tempo real (WebSocket)
3. 🔲 Tela de perfil
4. 🔲 Tela de ranking
5. 🔲 Upload de PDF (apostila)
6. 🔲 Responsividade mobile