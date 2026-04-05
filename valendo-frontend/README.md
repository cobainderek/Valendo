# Valendo Frontend

Frontend da plataforma Valendo — duelos de conhecimento em tempo real.

Construido com **Next.js 15**, **Tailwind CSS**, **shadcn/ui** e tema cyberpunk.

---

## Pre-requisitos

- [Node.js](https://nodejs.org/) 18+ (recomendado 20+)
- npm (incluso no Node.js)

---

## Instalacao

```bash
# Clone o repositorio (se ainda nao fez)
git clone <url-do-repo>
cd valendo/valendo-frontend

# Instale as dependencias
npm install
```

---

## Variaveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (ja existe um com valores padrao):

```env
# URL da API backend
NEXT_PUBLIC_API_URL=http://localhost:3333

# URL do WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3333/ws

# Mock auth — remova quando o backend estiver pronto
NEXT_PUBLIC_MOCK_AUTH=true
NEXT_PUBLIC_MOCK_EMAIL=admin@valendo.com
NEXT_PUBLIC_MOCK_PASSWORD=123456
NEXT_PUBLIC_MOCK_USER_NAME=Jogador
```

### Modo Mock

Com `NEXT_PUBLIC_MOCK_AUTH=true`, o sistema funciona sem backend:
- Login valida contra as credenciais do `.env.local`
- Cadastro aceita qualquer dado
- Salas, ranking e perfil usam dados mockados
- Perguntas vem do banco de fallback local

Para conectar ao backend real, mude para `NEXT_PUBLIC_MOCK_AUTH=false`.

---

## Executando

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Acesse: http://localhost:3000
```

### Credenciais de teste (modo mock)

| Campo | Valor |
|-------|-------|
| Email | `admin@valendo.com` |
| Senha | `123456` |

---

## Build de producao

```bash
# Gerar build otimizado
npm run build

# Rodar build localmente
npm start
```

---

## Scripts disponiveis

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento na porta 3000 |
| `npm run build` | Gera o build de producao |
| `npm start` | Roda o build de producao |
| `npm run lint` | Roda o ESLint |

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/            # Telas de login e cadastro
│   ├── (app)/             # Telas autenticadas
│   │   ├── dashboard/     # Listagem de salas
│   │   ├── ranking/       # Ranking semanal/mensal/geral
│   │   ├── profile/       # Perfil do jogador
│   │   └── room/[id]/     # Lobby e jogo
│   ├── layout.tsx         # Root layout (fonts, providers)
│   └── page.tsx           # Redirect inicial
├── components/
│   ├── ui/                # Componentes shadcn + skeleton, page-transition
│   ├── auth/              # Formularios de login e cadastro
│   ├── room/              # Room card, lobby, player list, join by code
│   ├── game/              # Question card, timer, scoreboard, game over
│   ├── ranking/           # Tabela, badges, card de posicao
│   ├── profile/           # Card de perfil, stats grid, historico
│   └── skeletons/         # Loading skeletons por pagina
├── contexts/              # AuthProvider, SocketProvider
├── hooks/                 # useAuth, useSocket
├── lib/                   # API client, auth utils, socket, gemini, mocks
├── types/                 # Interfaces TypeScript
└── middleware.ts          # Protecao de rotas
```

---

## Stack

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| Next.js | 16 | Framework React com App Router |
| React | 19 | Biblioteca UI |
| TypeScript | 5 | Tipagem estatica |
| Tailwind CSS | 4 | Estilizacao utility-first |
| shadcn/ui | 4 | Componentes UI |
| Lucide React | 0.577 | Icones |
| jwt-decode | 4 | Decodificacao de JWT no client |
| Sonner | 2 | Notificacoes toast |

---

## Tema

O frontend usa um tema **cyberpunk escuro** com:

- Background escuro (`#06060c`)
- Neon cyan (`#00f0ff`) como cor primaria
- Neon magenta (`#ff00e5`) como cor de destaque
- Efeitos de glow, grid de fundo, scanlines e bordas com gradiente
- Fontes: Inter (body) + JetBrains Mono (monospace)
