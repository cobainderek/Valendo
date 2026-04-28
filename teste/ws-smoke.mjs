// Smoke test do RoomsGateway:
// 1) cria 2 users via REST
// 2) U1 cria sala, U1 conecta WS + room:join → recebe room:state
// 3) U2 conecta WS + room:join (mesma sala)
// 4) U2 entra via REST POST /rooms/:code/join
//    → U1 deve receber 'room:player-joined' + 'room:state'
// 5) U1 (host) sai via REST → U2 deve receber 'room:state' (host transferido)
// 6) U2 cancela via REST DELETE → U1/U2 sockets recebem 'room:cancelled'
//
// Rodar de dentro de /home/derekderek197/Valendo/frontend (tem socket.io-client em node_modules)
//   node ../teste/ws-smoke.mjs

import { io } from '/home/derekderek197/Valendo/frontend/node_modules/socket.io-client/build/esm/index.js';

const BASE = 'https://dyotech.shop/api';
const WS_BASE = 'https://dyotech.shop';
const TS = Date.now();

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
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${text}`);
  }
  return data;
}

function makeSocket(token, label) {
  const s = io(WS_BASE, {
    path: '/api/socket.io',
    auth: { token },
    transports: ['websocket'],
    reconnection: false,
  });
  s.on('connect', () => console.log(`[${label}] connect sid=${s.id}`));
  s.on('connect_error', (e) => console.log(`[${label}] connect_error: ${e.message}`));
  s.on('disconnect', (r) => console.log(`[${label}] disconnect: ${r}`));
  // log all events
  s.onAny((evt, payload) => {
    if (evt === 'room:state') {
      console.log(`[${label}] ← ${evt} status=${payload?.status} players=${payload?.players?.length} hostId=${payload?.hostId}`);
    } else {
      console.log(`[${label}] ← ${evt}`, JSON.stringify(payload).slice(0, 200));
    }
  });
  return s;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('--- Setup users ---');
  await api('/users', { method: 'POST', body: { name: 'U1', tag: `u1ws_${TS}`, email: `u1ws${TS}@valendo.test`, password: 'senha123' } });
  await api('/users', { method: 'POST', body: { name: 'U2', tag: `u2ws_${TS}`, email: `u2ws${TS}@valendo.test`, password: 'senha123' } });
  const l1 = await api('/auth/login', { method: 'POST', body: { email: `u1ws${TS}@valendo.test`, password: 'senha123' } });
  const l2 = await api('/auth/login', { method: 'POST', body: { email: `u2ws${TS}@valendo.test`, password: 'senha123' } });
  const t1 = l1.access_token, t2 = l2.access_token;
  console.log('  tokens len:', t1.length, t2.length);

  console.log('--- U1 cria sala ---');
  const room = await api('/rooms', { method: 'POST', token: t1, body: { theme: 'WS Test', maxPlayers: 4 } });
  const code = room.code;
  console.log('  code:', code);

  console.log('--- U1 conecta WS + join ---');
  const s1 = makeSocket(t1, 'U1');
  await new Promise(r => s1.once('connect', r));
  s1.emit('room:join', { code });
  await sleep(500);

  console.log('--- U2 conecta WS + join ---');
  const s2 = makeSocket(t2, 'U2');
  await new Promise(r => s2.once('connect', r));
  s2.emit('room:join', { code });
  await sleep(500);

  console.log('--- U2 entra via REST POST /rooms/:code/join ---');
  await api(`/rooms/${code}/join`, { method: 'POST', token: t2 });
  await sleep(800);

  console.log('--- U1 (host) sai via REST → host transfer ---');
  await api(`/rooms/${code}/leave`, { method: 'POST', token: t1 });
  await sleep(800);

  console.log('--- U2 cancela sala via REST DELETE ---');
  await api(`/rooms/${code}`, { method: 'DELETE', token: t2 });
  await sleep(800);

  console.log('--- WS test invalid token ---');
  const sBad = io(WS_BASE, { path: '/api/socket.io', auth: { token: 'lixo' }, transports: ['websocket'], reconnection: false });
  sBad.on('connect_error', (e) => console.log('  expected fail:', e.message));
  await sleep(800);
  sBad.disconnect();

  s1.disconnect();
  s2.disconnect();
  await sleep(300);
  console.log('--- Done ---');
  process.exit(0);
})().catch((e) => { console.error('FAIL:', e); process.exit(1); });
