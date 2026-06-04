# Deploy — Valendo (dyotech.shop)

Checklist pra subir as mudanças em produção. Ordem importa.

## 1. Variáveis de ambiente (backend)

⚠️ **`JWT_SECRET` agora é OBRIGATÓRIA** — o backend se recusa a subir sem ela
(fail-fast no `main.ts`). O fallback hardcoded foi removido por segurança.

```env
JWT_SECRET=<segredo forte — NUNCA o valor de exemplo>
DATABASE_URL=postgresql://...
GEMINI_API_KEY=<chave do Google GenAI>
REDIS_URL=redis://...
CORS_ORIGINS=https://dyotech.shop,https://www.dyotech.shop
PORT=3001
API_HOST=0.0.0.0          # atrás do Nginx
```

## 2. Migration pendente

Nova coluna `rooms.question_time` (tempo por pergunta):

```bash
cd backend
npx prisma migrate deploy   # aplica 20260604030000_add_room_question_time
npx prisma generate
```

## 3. Backend

```bash
cd backend
docker compose -f docker-compose.prod.yml up -d --build
# ou, fora do docker: npm ci && npm run build && (re)start do processo
```

Mudanças que exigem o restart: presença no chat (`presence:*`),
`GET /rooms/:code/my-answers`, `questionTime` no DTO, hardening do JWT,
`startGame` preservando perguntas de PDF.

## 4. Frontend

```bash
cd frontend
docker compose -f docker-compose.prod.yml up -d --build
# ou: npm ci && npm run build (output standalone)
```

Envs do frontend (`.env.local` / build args):

```env
NEXT_PUBLIC_API_URL=https://dyotech.shop/api
NEXT_PUBLIC_WS_URL=wss://dyotech.shop   # opcional — deriva da API_URL se ausente
```

## 5. Nginx (conferir, sem mudança nova)

- `/api/` → backend :3001 (REST)
- `/api/socket.io` → backend :3001 com upgrade de WebSocket
  (`proxy_set_header Upgrade/Connection`) — usado pelos namespaces `/` e `/chat`

## 6. Smoke test pós-deploy

1. Registrar conta nova (apelido repetido deve gerar tag `apelido#NNNN`).
2. Duas contas: pedido de amizade aparece **na hora**; aceitar; mandar DM;
   badge de não lidas sobe em tempo real; bolinha verde de presença.
3. Criar sala **com PDF** → "Gerando perguntas do seu PDF…" → iniciar →
   perguntas vêm do material (não do tema).
4. Partida 1v1: intro VS, timer regressivo, placar ao vivo, F5 no meio
   retoma da pergunta certa, primeiro a terminar vê tela de espera,
   resultado aparece pros dois.
5. `npm run test` no backend: 17/17.
