// Smoke test do sistema social + chat:
// 1) cria 2 users via REST
// 2) U1 manda pedido pra U2 (via tag)
// 3) U2 lista pedidos pendentes
// 4) U2 aceita
// 5) U1 e U2 listam amigos (deve aparecer um para o outro)
// 6) U1 abre DM com U2
// 7) Ambos conectam socket no namespace /chat e dão chat:join
// 8) U1 envia mensagem via REST → U2 recebe via socket
// 9) U2 envia mensagem → U1 recebe
// 10) Edge: U3 sem amizade tenta abrir DM → 403
//
// Roda do CWD do frontend (tem socket.io-client instalado)

import { io } from '/home/derekderek197/Valendo/frontend/node_modules/socket.io-client/build/esm/index.js';

const BASE = 'https://dyotech.shop/api';
const WS_BASE = 'https://dyotech.shop';
const TS = Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    method: opts.method || 'GET',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let data = text;
  try { data = JSON.parse(text); } catch {}
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text}`);
  return data;
}

function makeSocket(token, label) {
  const s = io(WS_BASE + '/chat', {
    path: '/api/socket.io',
    auth: { token },
    transports: ['websocket'],
    reconnection: false,
  });
  s.on('connect', () => console.log(`[${label}] connect sid=${s.id}`));
  s.on('connect_error', (e) => console.log(`[${label}] connect_error: ${e.message}`));
  s.onAny((evt, payload) => {
    const summary = evt === 'chat:message'
      ? `from=${payload?.message?.author?.tag} text="${payload?.message?.text}"`
      : evt === 'chat:conversation-updated'
        ? `convId=${payload?.id} type=${payload?.type}`
        : evt === 'friend:request-received' || evt === 'friend:request-accepted'
          ? `id=${payload?.id} ${payload?.from?.tag ?? payload?.by?.tag}`
          : JSON.stringify(payload).slice(0, 200);
    console.log(`[${label}] ← ${evt}  ${summary}`);
  });
  return s;
}

(async () => {
  const tag1 = `f1_${TS}`, tag2 = `f2_${TS}`, tag3 = `f3_${TS}`;
  const email1 = `f1_${TS}@valendo.test`, email2 = `f2_${TS}@valendo.test`, email3 = `f3_${TS}@valendo.test`;

  console.log('--- Setup users ---');
  await api('/users', { method: 'POST', body: { name: 'F1', tag: tag1, email: email1, password: 'senha123' } });
  await api('/users', { method: 'POST', body: { name: 'F2', tag: tag2, email: email2, password: 'senha123' } });
  await api('/users', { method: 'POST', body: { name: 'F3', tag: tag3, email: email3, password: 'senha123' } });
  const t1 = (await api('/auth/login', { method: 'POST', body: { email: email1, password: 'senha123' } })).access_token;
  const t2 = (await api('/auth/login', { method: 'POST', body: { email: email2, password: 'senha123' } })).access_token;
  const t3 = (await api('/auth/login', { method: 'POST', body: { email: email3, password: 'senha123' } })).access_token;
  console.log('  tokens OK');

  console.log('--- Conectar sockets cedo (pra capturar friend events) ---');
  const s1 = makeSocket(t1, 'U1');
  const s2 = makeSocket(t2, 'U2');
  const s3 = makeSocket(t3, 'U3');
  await Promise.all([
    new Promise((r) => s1.once('connect', r)),
    new Promise((r) => s2.once('connect', r)),
    new Promise((r) => s3.once('connect', r)),
  ]);

  console.log('--- U1 manda pedido de amizade pra U2 ---');
  const reqOut = await api('/friends/requests', { method: 'POST', token: t1, body: { tag: tag2 } });
  console.log('  status:', reqOut.status, 'id:', reqOut.id);
  await sleep(400); // aguardar friend:request-received chegar em U2

  console.log('--- U2 lista pedidos recebidos ---');
  const incoming = await api('/friends/requests/incoming', { token: t2 });
  console.log('  incoming:', incoming.length, 'from:', incoming[0]?.from?.tag);

  console.log('--- U2 aceita ---');
  const accepted = await api(`/friends/requests/${incoming[0].id}/accept`, { method: 'POST', token: t2 });
  console.log('  accepted status:', accepted.status);
  await sleep(400); // aguardar friend:request-accepted chegar em U1

  console.log('--- U1 lista amigos ---');
  const friends1 = await api('/friends', { token: t1 });
  console.log('  U1 friends:', friends1.map((f) => f.tag));

  console.log('--- U1 abre DM com U2 ---');
  const dm = await api('/conversations/dm', { method: 'POST', token: t1, body: { userId: friends1[0].id } });
  const convId = dm.id;
  console.log('  convId:', convId, 'title:', dm.title, 'members:', dm.members.length);
  await sleep(400);

  console.log('--- Ambos dão chat:join ---');
  s1.emit('chat:join', { conversationId: convId });
  s2.emit('chat:join', { conversationId: convId });
  await sleep(300);

  console.log('--- U1 envia "olá U2" via REST ---');
  await api(`/conversations/${convId}/messages`, { method: 'POST', token: t1, body: { text: 'olá U2' } });
  await sleep(500);

  console.log('--- U2 envia "fala bro" ---');
  await api(`/conversations/${convId}/messages`, { method: 'POST', token: t2, body: { text: 'fala bro' } });
  await sleep(500);

  console.log('--- U2 marca como lido (last message) ---');
  const list = await api(`/conversations/${convId}/messages?limit=10`, { token: t2 });
  const lastId = list.items[0]?.id;
  if (lastId) {
    await api(`/conversations/${convId}/read`, { method: 'POST', token: t2, body: { lastMessageId: lastId } });
  }
  await sleep(400);

  console.log('--- U1 lista conversas (deve ter 1) ---');
  const list1 = await api('/conversations', { token: t1 });
  console.log('  U1 conversations:', list1.length, 'unread:', list1[0]?.unread, 'lastMsg:', list1[0]?.lastMessage?.text);

  console.log('--- Edge: U3 (não-amigo) tenta abrir DM com U1 → 403 ---');
  try {
    await api('/conversations/dm', { method: 'POST', token: t3, body: { userId: friends1[0]?.id ?? '1' } });
    console.log('  FAIL: deveria ter dado 403');
  } catch (e) {
    console.log('  expected fail:', String(e).slice(0, 120));
  }

  console.log('--- Edge: pedido pra si mesmo → 400 ---');
  try {
    await api('/friends/requests', { method: 'POST', token: t1, body: { tag: tag1 } });
  } catch (e) {
    console.log('  expected fail:', String(e).slice(0, 120));
  }

  console.log('--- Edge: pedido duplicado → 409 ---');
  // U1 manda de novo pra U2 (já amigos) → conflict
  try {
    await api('/friends/requests', { method: 'POST', token: t1, body: { tag: tag2 } });
  } catch (e) {
    console.log('  expected fail:', String(e).slice(0, 120));
  }

  console.log('--- Edge: pedidos cruzados → auto-accept ---');
  // U3 manda pra U1; U1 manda pra U3 → deve auto-aceitar
  await api('/friends/requests', { method: 'POST', token: t3, body: { tag: tag1 } });
  await sleep(200);
  const auto = await api('/friends/requests', { method: 'POST', token: t1, body: { tag: tag3 } });
  console.log('  auto-accept status:', auto.status);

  console.log('--- Cleanup sockets ---');
  s1.disconnect(); s2.disconnect(); s3.disconnect();
  await sleep(300);
  console.log('--- Done ---');
  process.exit(0);
})().catch((e) => { console.error('FAIL:', e); process.exit(1); });
