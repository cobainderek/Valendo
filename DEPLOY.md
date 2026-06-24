# Deploy — Valendo (dyotech.shop)

Checklist pra subir as mudanças em produção. Ordem importa.

## 1. Variáveis de ambiente (backend)

⚠️ **`JWT_SECRET` agora é OBRIGATÓRIA** — o backend se recusa a subir sem ela
(fail-fast no `main.ts`). O fallback hardcoded foi removido por segurança.

```env
NODE_ENV=production       # OBRIGATÓRIA em prod: desativa o Swagger (/api/docs)
JWT_SECRET=<segredo forte — NUNCA o valor de exemplo>
DATABASE_URL=postgresql://...
GEMINI_API_KEY=<chave do Google GenAI>
REDIS_URL=redis://...
CORS_ORIGINS=https://dyotech.shop,https://www.dyotech.shop
PORT=3001
API_HOST=0.0.0.0          # atrás do Nginx
GOOGLE_CLIENT_ID=<client_id público do OAuth — SEM o client_secret>
```

> `helmet` e rate limiting (`@nestjs/throttler`) já vêm ligados sem env nova.
> O `docker-compose.prod.yml` já define `NODE_ENV=production` (Swagger off em prod).
> **Portas no host da VM (loopback):** Postgres `127.0.0.1:5442`, Redis `127.0.0.1:6379`,
> backend `127.0.0.1:3901` (container escuta `:3001`). Para rodar `prisma migrate`/scripts
> direto na VM (fora do container), aponte `DATABASE_URL` para `localhost:5442`.

### Login com Google (GIS)

- Console: console.cloud.google.com → Credentials → OAuth Client ID (Web).
  Origens JS autorizadas: `https://dyotech.shop` e `http://localhost:3000`.
- O fluxo é por **ID Token** (popup no frontend) — o `client_secret` NÃO é
  usado em lugar nenhum; nunca colocar em env/código.
- Sem `GOOGLE_CLIENT_ID` no backend o endpoint `/auth/google` responde 503;
  sem `NEXT_PUBLIC_GOOGLE_CLIENT_ID` no frontend o botão fica oculto.

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

**Rodada de hardening (esta versão):**
- `GET /rooms/:code` agora exige JWT (não vaza estado/roster de salas privadas).
- `@nestjs/throttler` global (auth e geração de perguntas mais restritos) + `helmet`.
- Upload de PDF com teto de 5MB + `fileFilter` (só `application/pdf`).
- `SubmitAnswerDto` no `/rooms/:code/answer` (body inválido → 400, antes 500).
- `submitAnswer` atômico (P2002 → 409; placares com `{ increment }`).
- 503/429 do Gemini → `503` (antes 500); bcrypt rounds 12.
- Swagger só fora de produção (`/api/docs`).

> **Premissa de escala (Socket.IO):** a presença do chat é em memória do processo
> (`chat.gateway.ts`) e **não há Redis adapter** — o deploy assume **uma única
> instância** do backend. Para escalar horizontalmente, adotar
> `@socket.io/redis-adapter` + presença em Redis antes de subir réplicas.

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
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client_id público>  # vazio = botão Google oculto
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
5. Login com Google: conta nova → cria usuário (tag única) e cai no lobby;
   mesma conta de novo → loga na conta existente (XP preservado).
6. `npm run test` no backend: **28/28** unit.
7. Bateria e2e de todas as rotas (precisa do `--experimental-vm-modules`; Prisma 7
   usa `import()` dinâmico), a partir de `backend/` com a infra de pé:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5433/valendo?schema=public" \
   REDIS_URL="redis://localhost:6380" NODE_OPTIONS=--experimental-vm-modules \
   npm run test:e2e -- all-routes.e2e-spec.ts --runInBand --forceExit
   ```
   Esperado: `74 passed, 3 skipped`. (Portas 5433/6380 = host em DEV; na VM use 5442/6379.)
