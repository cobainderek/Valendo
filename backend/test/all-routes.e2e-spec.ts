/**
 * Bateria e2e cobrindo TODA a superfície REST do backend Valendo (NestJS).
 *
 * Sobe o AppModule real (mesmo setup do main.ts: prefixo global `api` +
 * ValidationPipe whitelist) e exercita os 8 controllers / 28 endpoints:
 * app, auth, users, rooms, questions, friends, ranking e chat(conversations).
 *
 * COMO RODAR (a partir de backend/, com a infra do docker-compose de pé):
 *
 *   DATABASE_URL="postgresql://user:password@localhost:5433/valendo?schema=public" \
 *   REDIS_URL="redis://localhost:6380" \
 *   JWT_SECRET="<de backend/.env>" \
 *   GEMINI_API_KEY="<de backend/.env>" \
 *   npm run test:e2e -- all-routes.e2e-spec.ts
 *
 * Observações importantes:
 * - O backend NÃO tem APP_GUARD global; a auth é por @UseGuards(AuthGuard('jwt'))
 *   no método/controller. Endpoints sem guard são públicos (app, auth/*,
 *   POST /users, GET /rooms, GET /rooms/:code, GET /ranking/weekly).
 * - O host é auto-adicionado como RoomPlayer ao criar a sala, então o happy-path
 *   de POST /rooms/:code/join usa um SEGUNDO usuário entrando na sala do primeiro
 *   (o próprio host receberia 409 "Você já está nesta sala").
 * - Rotas que exigem 2 jogadores + duelo iniciado (start/answer/my-answers com
 *   partida em andamento) e a geração de perguntas via Gemini real são `it.skip`
 *   por dependerem de estado/serviço externo — ver comentários em cada uma.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpThrottlerGuard } from './../src/common/guards/http-throttler.guard';

// Mesmo patch global do main.ts: IDs do Prisma são BigInt e o
// JSON.stringify padrão não sabe serializá-los. Sem isto, qualquer resposta
// com id (ex.: POST /api/users) estoura 500 "Do not know how to serialize a
// BigInt". Como o e2e sobe o AppModule direto (não passa por main.ts),
// precisamos reproduzir o patch aqui.
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// Boot do AppModule sobe Prisma (Postgres) e ioredis; dê folga ao Jest.
jest.setTimeout(60_000);

describe('All REST routes (e2e)', () => {
  let app: INestApplication;
  let http: any;

  // Identidade única por execução para resiliência (sem colisão de email/tag).
  const RUN = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const userA = {
    name: 'E2E User A',
    tag: `e2e_a_${RUN}`,
    email: `e2e_a_${RUN}@example.com`,
    password: 'senha123',
  };
  const userB = {
    name: 'E2E User B',
    tag: `e2e_b_${RUN}`,
    email: `e2e_b_${RUN}@example.com`,
    password: 'senha123',
  };

  // Preenchidos no beforeAll.
  let tokenA = '';
  let tokenB = '';
  let userAId = '';
  let userBId = '';

  // Sala criada pelo usuário A; usada nos testes de rooms/conversations.
  let roomCode = '';

  const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Desativa o rate limit nos testes: a bateria dispara dezenas de requests
      // em sequência (não é um cliente real), então sem isto alguns viriam 429.
      .overrideGuard(HttpThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    // Mesmo setup do main.ts (sem CORS/trust-proxy, irrelevantes p/ supertest).
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    http = app.getHttpServer();

    // Cadastra os dois usuários (POST /api/users é público).
    const regA = await request(http).post('/api/users').send(userA);
    expect(regA.status).toBe(201);
    userAId = String(regA.body.id);

    const regB = await request(http).post('/api/users').send(userB);
    expect(regB.status).toBe(201);
    userBId = String(regB.body.id);

    // Loga ambos e guarda os tokens.
    const logA = await request(http)
      .post('/api/auth/login')
      .send({ email: userA.email, password: userA.password });
    expect(logA.status).toBe(200);
    expect(logA.body.access_token).toBeDefined();
    tokenA = logA.body.access_token;

    const logB = await request(http)
      .post('/api/auth/login')
      .send({ email: userB.email, password: userB.password });
    expect(logB.status).toBe(200);
    tokenB = logB.body.access_token;

    // Sala compartilhada para os testes de rooms (não-privada p/ aparecer no lobby).
    const room = await request(http)
      .post('/api/rooms')
      .set(bearer(tokenA))
      .send({ theme: 'Geografia', isPrivate: false, maxPlayers: 4 });
    expect(room.status).toBe(201);
    roomCode = room.body.code;
    expect(roomCode).toHaveLength(6);
  });

  afterAll(async () => {
    // Best-effort: tenta cancelar a sala criada para não acumular lixo.
    if (roomCode && tokenA) {
      await request(http)
        .delete(`/api/rooms/${roomCode}`)
        .set(bearer(tokenA))
        .catch(() => undefined);
    }
    if (app) await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 401 sem token — TODAS as rotas protegidas (@UseGuards(AuthGuard('jwt'))).
  // Dirigido por tabela para garantir cobertura de toda a superfície protegida.
  // Path-params usam placeholders válidos (a auth roda antes do handler, então
  // o valor concreto é irrelevante para o 401).
  // ─────────────────────────────────────────────────────────────────────────
  describe('protected routes reject without token (401)', () => {
    const protectedRoutes: Array<[string, string]> = [
      // users
      ['get', '/api/users/me'],
      ['patch', '/api/users/me'],
      ['get', '/api/users/me/history'],
      // rooms (todas exceto GET / — o lobby público). GET /:code agora exige
      // token (não vazar estado/roster de salas privadas sem auth).
      ['post', '/api/rooms'],
      ['get', '/api/rooms/ABC123'],
      ['get', '/api/rooms/ABC123/my-answers'],
      ['post', '/api/rooms/ABC123/join'],
      ['post', '/api/rooms/ABC123/start'],
      ['post', '/api/rooms/ABC123/answer'],
      ['post', '/api/rooms/ABC123/leave'],
      ['delete', '/api/rooms/ABC123'],
      // questions
      ['post', '/api/questions/generate'],
      // friends (guard no controller — todas)
      ['get', '/api/friends/search'],
      ['get', '/api/friends'],
      ['post', '/api/friends/requests'],
      ['get', '/api/friends/requests/incoming'],
      ['get', '/api/friends/requests/outgoing'],
      ['post', '/api/friends/requests/1/accept'],
      ['post', '/api/friends/requests/1/reject'],
      ['delete', '/api/friends/1'],
      // conversations (guard no controller — todas)
      ['get', '/api/conversations'],
      ['post', '/api/conversations/dm'],
      ['post', '/api/conversations/group'],
      ['get', '/api/conversations/1'],
      ['post', '/api/conversations/1/members'],
      ['delete', '/api/conversations/1/members/2'],
      ['get', '/api/conversations/1/messages'],
      ['post', '/api/conversations/1/messages'],
      ['post', '/api/conversations/1/read'],
    ];

    it.each(protectedRoutes)('%s %s -> 401', async (method, path) => {
      const res = await (request(http) as any)[method](path).send({});
      expect(res.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // App / health
  // ─────────────────────────────────────────────────────────────────────────
  describe('app', () => {
    it('GET /api -> 200 "Hello World!" (público)', async () => {
      const res = await request(http).get('/api');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Hello World!');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Auth
  // ─────────────────────────────────────────────────────────────────────────
  describe('auth', () => {
    it('POST /api/auth/login (válido) -> 200 + access_token', async () => {
      const res = await request(http)
        .post('/api/auth/login')
        .send({ email: userA.email, password: userA.password });
      expect(res.status).toBe(200);
      expect(res.body.access_token).toEqual(expect.any(String));
      expect(String(res.body.user.id)).toBe(userAId);
    });

    it('POST /api/auth/login (senha errada) -> 401', async () => {
      const res = await request(http)
        .post('/api/auth/login')
        .send({ email: userA.email, password: 'senhaErrada!' });
      expect(res.status).toBe(401);
    });

    it('POST /api/auth/login (DTO inválido: email malformado + senha curta) -> 400', async () => {
      const res = await request(http)
        .post('/api/auth/login')
        .send({ email: 'nao-eh-email', password: '123' });
      expect(res.status).toBe(400);
    });

    it('POST /api/auth/recover -> 200 { ok: true } (no-op anti-enumeração)', async () => {
      const res = await request(http)
        .post('/api/auth/recover')
        .send({ email: userA.email });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    it('POST /api/auth/google (idToken bobo) -> 401 ou 503 (depende de GOOGLE_CLIENT_ID)', async () => {
      // Sem GOOGLE_CLIENT_ID -> 503; com ele -> token inválido -> 401.
      const res = await request(http)
        .post('/api/auth/google')
        .send({ idToken: 'token-invalido' });
      expect([401, 503]).toContain(res.status);
    });

    it('POST /api/auth/google (DTO inválido: sem idToken) -> 400', async () => {
      const res = await request(http).post('/api/auth/google').send({});
      expect(res.status).toBe(400);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Users
  // ─────────────────────────────────────────────────────────────────────────
  describe('users', () => {
    it('POST /api/users (DTO inválido: email ruim + senha curta) -> 400', async () => {
      const res = await request(http)
        .post('/api/users')
        .send({ name: 'X', tag: `bad_${RUN}`, email: 'nope', password: '12' });
      expect(res.status).toBe(400);
    });

    it('GET /api/users/me -> 200 + perfil do usuário logado', async () => {
      const res = await request(http).get('/api/users/me').set(bearer(tokenA));
      expect(res.status).toBe(200);
      expect(String(res.body.id ?? res.body.user?.id)).toBe(userAId);
    });

    it('PATCH /api/users/me (atualiza nome) -> 200', async () => {
      const res = await request(http)
        .patch('/api/users/me')
        .set(bearer(tokenA))
        .send({ name: 'E2E User A (edited)' });
      expect(res.status).toBe(200);
    });

    it('GET /api/users/me/history -> 200 (paginação cursor/limit)', async () => {
      const res = await request(http)
        .get('/api/users/me/history?limit=5')
        .set(bearer(tokenA));
      expect(res.status).toBe(200);
    });

    it('GET /api/users/me/history?cursor=abc -> 400 (cursor inválido)', async () => {
      const res = await request(http)
        .get('/api/users/me/history?cursor=not-a-bigint')
        .set(bearer(tokenA));
      expect(res.status).toBe(400);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Rooms
  // ─────────────────────────────────────────────────────────────────────────
  describe('rooms', () => {
    it('GET /api/rooms (lobby, público) -> 200 + array', async () => {
      const res = await request(http).get('/api/rooms');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/rooms/:code (com token) -> 200 + estado da sala', async () => {
      const res = await request(http).get(`/api/rooms/${roomCode}`).set(bearer(tokenA));
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(roomCode);
      expect(Array.isArray(res.body.players)).toBe(true);
    });

    it('GET /api/rooms/ZZZZZZ (inexistente, com token) -> 404', async () => {
      const res = await request(http).get('/api/rooms/ZZZZZZ').set(bearer(tokenA));
      expect(res.status).toBe(404);
    });

    it('POST /api/rooms/:code/join (usuário B entra na sala de A) -> 200/201', async () => {
      const res = await request(http)
        .post(`/api/rooms/${roomCode}/join`)
        .set(bearer(tokenB))
        .send({});
      expect([200, 201]).toContain(res.status);
      // B agora deve constar entre os players.
      const players: any[] = res.body.players ?? [];
      expect(players.some((p) => String(p.id) === userBId)).toBe(true);
    });

    it('POST /api/rooms/:code/join (host tentando re-entrar) -> 409', async () => {
      const res = await request(http)
        .post(`/api/rooms/${roomCode}/join`)
        .set(bearer(tokenA))
        .send({});
      expect(res.status).toBe(409);
    });

    it('GET /api/rooms/:code/my-answers (sem duelo iniciado) -> 200 { answers: [] }', async () => {
      const res = await request(http)
        .get(`/api/rooms/${roomCode}/my-answers`)
        .set(bearer(tokenA));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.answers)).toBe(true);
    });

    // Requer host + >= 2 jogadores E gera perguntas via Gemini real (custo/quota).
    // Para habilitar: garanta 2 players (já temos A+B), exporte GEMINI_API_KEY
    // válido e troque para `it(...)`. Pode demorar (chamada externa).
    it.skip('POST /api/rooms/:code/start -> inicia duelo (Gemini real)', async () => {
      const res = await request(http)
        .post(`/api/rooms/${roomCode}/start`)
        .set(bearer(tokenA))
        .send({});
      expect([200, 201]).toContain(res.status);
      expect(res.body.status).toBe('playing');
    });

    // Depende de uma partida em andamento (status 'playing') + questionId real
    // vindo do duelo. Encadear após o start acima quando habilitado.
    it.skip('POST /api/rooms/:code/answer -> registra resposta (requer duelo playing)', async () => {
      const res = await request(http)
        .post(`/api/rooms/${roomCode}/answer`)
        .set(bearer(tokenA))
        .send({ questionId: '1', selectedAnswer: 'A' });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /api/rooms/:code/leave (B sai da sala) -> 200', async () => {
      const res = await request(http)
        .post(`/api/rooms/${roomCode}/leave`)
        .set(bearer(tokenB))
        .send({});
      expect(res.status).toBe(200);
    });

    it('DELETE /api/rooms/:code (host cancela a sala) -> 200', async () => {
      // Cria uma sala descartável só para validar o cancelamento sem afetar a
      // sala compartilhada (que o afterAll também tenta limpar).
      const created = await request(http)
        .post('/api/rooms')
        .set(bearer(tokenA))
        .send({ theme: 'Descartável', isPrivate: true });
      expect(created.status).toBe(201);
      const code = created.body.code;

      const res = await request(http)
        .delete(`/api/rooms/${code}`)
        .set(bearer(tokenA))
        .send({});
      expect(res.status).toBe(200);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Questions (Gemini real) — skip por padrão.
  // ─────────────────────────────────────────────────────────────────────────
  describe('questions', () => {
    // Chama o Google Gemini de verdade (consome quota) e exige roomCode válido.
    // Para habilitar: exporte GEMINI_API_KEY real e troque para `it(...)`.
    // Envio multipart: .field('roomCode', code).field('theme', '...') e,
    // opcionalmente, .attach('file', '<caminho-de-um.pdf>').
    it.skip('POST /api/questions/generate -> 200/201 (Gemini real)', async () => {
      const created = await request(http)
        .post('/api/rooms')
        .set(bearer(tokenA))
        .send({ theme: 'Biologia', isPrivate: true });
      const code = created.body.code;

      const res = await request(http)
        .post('/api/questions/generate')
        .set(bearer(tokenA))
        .field('roomCode', code)
        .field('theme', 'Biologia celular');
      expect([200, 201]).toContain(res.status);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Friends
  // ─────────────────────────────────────────────────────────────────────────
  describe('friends', () => {
    let requestId = '';

    it('GET /api/friends/search?q=... -> 200 + array', async () => {
      const res = await request(http)
        .get(`/api/friends/search?q=${encodeURIComponent(userB.tag)}&limit=5`)
        .set(bearer(tokenA));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/friends -> 200 + array', async () => {
      const res = await request(http).get('/api/friends').set(bearer(tokenA));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/friends/requests (A -> B por tag) -> 200/201', async () => {
      const res = await request(http)
        .post('/api/friends/requests')
        .set(bearer(tokenA))
        .send({ tag: userB.tag });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /api/friends/requests (DTO inválido: sem tag) -> 400', async () => {
      const res = await request(http)
        .post('/api/friends/requests')
        .set(bearer(tokenA))
        .send({});
      expect(res.status).toBe(400);
    });

    it('GET /api/friends/requests/outgoing (A) -> 200 + array', async () => {
      const res = await request(http)
        .get('/api/friends/requests/outgoing')
        .set(bearer(tokenA));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/friends/requests/incoming (B vê o pedido) -> 200 + captura id', async () => {
      const res = await request(http)
        .get('/api/friends/requests/incoming')
        .set(bearer(tokenB));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const pending = res.body.find((r: any) => r.id != null);
      if (pending) requestId = String(pending.id);
    });

    it('POST /api/friends/requests/:id/accept (B aceita) -> 200', async () => {
      expect(requestId).not.toBe('');
      const res = await request(http)
        .post(`/api/friends/requests/${requestId}/accept`)
        .set(bearer(tokenB))
        .send({});
      expect(res.status).toBe(200);
    });

    it('POST /api/friends/requests/abc/accept -> 400 (id inválido)', async () => {
      const res = await request(http)
        .post('/api/friends/requests/not-a-number/accept')
        .set(bearer(tokenB))
        .send({});
      expect(res.status).toBe(400);
    });

    // reject de um pedido inexistente: cobre o caminho do controller; o service
    // pode responder 200 (idempotente) ou 4xx. Aceitamos ambos.
    it('POST /api/friends/requests/:id/reject -> 200 ou 4xx', async () => {
      const res = await request(http)
        .post('/api/friends/requests/999999999/reject')
        .set(bearer(tokenB))
        .send({});
      expect([200, 400, 403, 404]).toContain(res.status);
    });

    it('DELETE /api/friends/abc -> 400 (id inválido)', async () => {
      const res = await request(http)
        .delete('/api/friends/not-a-number')
        .set(bearer(tokenA))
        .send({});
      expect(res.status).toBe(400);
    });

    // NB: a remoção real da amizade (DELETE /api/friends/:userId, happy-path)
    // roda no final, DEPOIS do bloco de conversations — abrir DM exige que
    // A e B sejam amigos, então mantemos o vínculo vivo até lá.
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Ranking
  // ─────────────────────────────────────────────────────────────────────────
  describe('ranking', () => {
    it('GET /api/ranking/weekly (público) -> 200 + array', async () => {
      const res = await request(http).get('/api/ranking/weekly?limit=5');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Chat / Conversations
  // ─────────────────────────────────────────────────────────────────────────
  describe('conversations (chat)', () => {
    let dmId = '';
    let groupId = '';
    let messageId = '';

    it('GET /api/conversations -> 200 + array', async () => {
      const res = await request(http)
        .get('/api/conversations')
        .set(bearer(tokenA));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/conversations/dm (A abre DM com B) -> 200 + captura id', async () => {
      const res = await request(http)
        .post('/api/conversations/dm')
        .set(bearer(tokenA))
        .send({ userId: userBId });
      expect(res.status).toBe(200);
      expect(res.body.id).toBeDefined();
      dmId = String(res.body.id);
    });

    it('POST /api/conversations/dm (DTO inválido: sem userId) -> 400', async () => {
      const res = await request(http)
        .post('/api/conversations/dm')
        .set(bearer(tokenA))
        .send({});
      expect(res.status).toBe(400);
    });

    it('POST /api/conversations/group (A cria grupo com B) -> 200/201 + captura id', async () => {
      const res = await request(http)
        .post('/api/conversations/group')
        .set(bearer(tokenA))
        .send({ name: `Grupo ${RUN}`, memberIds: [userBId] });
      expect([200, 201]).toContain(res.status);
      expect(res.body.id).toBeDefined();
      groupId = String(res.body.id);
    });

    it('POST /api/conversations/group (DTO inválido: memberIds vazio) -> 400', async () => {
      const res = await request(http)
        .post('/api/conversations/group')
        .set(bearer(tokenA))
        .send({ name: 'Vazio', memberIds: [] });
      expect(res.status).toBe(400);
    });

    it('GET /api/conversations/:id (A vê a DM) -> 200', async () => {
      expect(dmId).not.toBe('');
      const res = await request(http)
        .get(`/api/conversations/${dmId}`)
        .set(bearer(tokenA));
      expect(res.status).toBe(200);
    });

    it('GET /api/conversations/abc -> 400 (id inválido)', async () => {
      const res = await request(http)
        .get('/api/conversations/not-a-number')
        .set(bearer(tokenA));
      expect(res.status).toBe(400);
    });

    it('POST /api/conversations/:id/messages (A envia na DM) -> 200/201 + captura id', async () => {
      expect(dmId).not.toBe('');
      const res = await request(http)
        .post(`/api/conversations/${dmId}/messages`)
        .set(bearer(tokenA))
        .send({ text: 'olá do e2e' });
      expect([200, 201]).toContain(res.status);
      expect(res.body.id).toBeDefined();
      messageId = String(res.body.id);
    });

    it('POST /api/conversations/:id/messages (DTO inválido: text vazio) -> 400', async () => {
      const res = await request(http)
        .post(`/api/conversations/${dmId}/messages`)
        .set(bearer(tokenA))
        .send({ text: '' });
      expect(res.status).toBe(400);
    });

    it('GET /api/conversations/:id/messages -> 200 + { items: [] }', async () => {
      const res = await request(http)
        .get(`/api/conversations/${dmId}/messages?limit=10`)
        .set(bearer(tokenA));
      expect(res.status).toBe(200);
      // listMessages devolve { items, nextCursor } (paginação), não array cru.
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('POST /api/conversations/:id/read (A marca lida) -> 200', async () => {
      expect(messageId).not.toBe('');
      const res = await request(http)
        .post(`/api/conversations/${dmId}/read`)
        .set(bearer(tokenA))
        .send({ lastMessageId: messageId });
      expect(res.status).toBe(200);
    });

    it('POST /api/conversations/:id/members (A adiciona B ao grupo de novo) -> 200/201 ou 409', async () => {
      // B já é membro (entrou na criação); aceitamos sucesso idempotente ou 409.
      expect(groupId).not.toBe('');
      const res = await request(http)
        .post(`/api/conversations/${groupId}/members`)
        .set(bearer(tokenA))
        .send({ userId: userBId });
      expect([200, 201, 409]).toContain(res.status);
    });

    it('DELETE /api/conversations/:id/members/:userId (A remove B do grupo) -> 200', async () => {
      expect(groupId).not.toBe('');
      const res = await request(http)
        .delete(`/api/conversations/${groupId}/members/${userBId}`)
        .set(bearer(tokenA))
        .send({});
      expect(res.status).toBe(200);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Friends — desfazer amizade (happy-path do DELETE) por ÚLTIMO.
  // Roda depois de conversations porque POST /conversations/dm exige que A e B
  // sejam amigos; só agora é seguro desfazer o vínculo criado no bloco friends.
  // ─────────────────────────────────────────────────────────────────────────
  describe('friends (cleanup)', () => {
    it('DELETE /api/friends/:userId (A remove B) -> 200', async () => {
      const res = await request(http)
        .delete(`/api/friends/${userBId}`)
        .set(bearer(tokenA))
        .send({});
      expect(res.status).toBe(200);
    });
  });
});
