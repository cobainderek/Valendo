# 📋 TODO — Frontend Valendo

Lista do que falta no frontend pra app ficar completa. As rotas do backend serão implementadas em paralelo (Dyone + Claude no backend). Este arquivo é o contrato: **assim que cada rota subir, você sabe exatamente o que mexer aqui.**

Status legend: `[ ]` aberto · `[~]` em andamento · `[x]` feito

---

## 🧹 Fase 0 — Limpeza (faça primeiro, sem dependência)

- [ ] **Apagar** `app/dashboard/page.tsx` — só redireciona pra `/lobby`, ninguém aponta
- [ ] **Apagar** `app/auth/register/page.tsx` — redirect inútil; signup vive no formulário do `/auth/login`
- [ ] **Apagar** `app/duel/[id]/page.tsx` — vai virar componente reutilizável na Fase 4 (não delete já se preferir guardar a animação como referência)

---

## 🧑 Fase 1 — Tela de Perfil (`/profile`)

Hoje a página só lê do Zustand/`localStorage`. O `globalXp` fica congelado entre logins. Falta buscar do backend.

### Rotas backend disponíveis
| Método | Path | Auth |
|---|---|---|
| `GET` | `/api/users/me` | JWT |
| `PATCH` | `/api/users/me` | JWT |

### Contratos

**`GET /api/users/me`** → retorna:
```ts
{
  id: string
  name: string
  tag: string
  email: string
  globalXp: number
  stats: {
    roomsHosted: number
    duelsPlayed: number
    duelsWon: number
    correctAnswersTotal: number
  }
}
```

**`PATCH /api/users/me`** → body:
```ts
{
  name?: string
  tag?: string
  currentPassword?: string  // obrigatório se mandar newPassword
  newPassword?: string
}
```
Retorna o mesmo shape do `GET /me`.

### Trabalho no frontend

- [ ] Criar `services/users.ts` com `obterMeuPerfil()` e `atualizarPerfil(dto)`
- [ ] Atualizar tipo `User` em `services/auth.ts` pra incluir `stats` (ou criar `UserDetalhe` separado em `services/users.ts`)
- [ ] `app/profile/page.tsx` → `useEffect` chama `obterMeuPerfil()` e passa pro `ProfileCard`
- [ ] `components/profile/ProfileCard.tsx` → exibir os 4 stats novos (sala criada, duelos, vitórias, acertos)
- [ ] `app/lobby/page.tsx` → também chama `obterMeuPerfil()` no mount pra atualizar XP da sidebar
- [ ] Adicionar botão **Editar perfil** no `ProfileCard` que abre form (inline ou modal) pra `PATCH /me`
- [ ] Após editar, atualizar o `useAuthStore` (`storeLogin(token, novoUser)` mantém o token e troca o user)

### Esboço do `services/users.ts`
```ts
import { apiFetch } from './api'

export interface UserStats {
  roomsHosted: number
  duelsPlayed: number
  duelsWon: number
  correctAnswersTotal: number
}

export interface UserDetalhe {
  id: string
  name: string
  tag: string
  email: string
  globalXp: number
  stats: UserStats
}

export async function obterMeuPerfil(): Promise<UserDetalhe> {
  return apiFetch<UserDetalhe>('/users/me')
}

export interface AtualizarPerfilDTO {
  name?: string
  tag?: string
  currentPassword?: string
  newPassword?: string
}

export async function atualizarPerfil(dto: AtualizarPerfilDTO): Promise<UserDetalhe> {
  return apiFetch<UserDetalhe>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}
```

---

## 🔑 Fase 1.2 — Recover password (placeholder)

A rota fantasma vai existir. Nada muda no front, mas marque como verificado:

- [ ] Confirmar que `/auth/login` ainda mostra "enviado!" sem erro depois que `POST /api/auth/recover` existir no backend (hoje engole erro silencioso por design anti-enumeração)

---

## 🚪 Fase 2 — Ciclo de vida da sala

### 2.1 Sair da sala (`POST /api/rooms/:code/leave`)

Hoje o usuário fecha a aba e fica zumbi em `RoomPlayer`. Tem que poder sair explicitamente.

**Backend** retorna `{ ok: true }` ou `{ status: 'cancelled' }` (caso o host que saiu estivesse sozinho).

- [ ] `services/rooms.ts` → adicionar `sairSala(code: string)`
- [ ] `app/room/[id]/page.tsx` → botão "Sair" no header (só quando `status === 'waiting'`)
- [ ] `WaitingRoom.tsx` → botão alternativo no card central
- [ ] No `useEffect` de cleanup do `app/room/[id]/page.tsx`, chamar `sairSala(code)` se `status === 'waiting'` (best-effort, sem bloquear navegação)

### 2.2 Cancelar sala (`DELETE /api/rooms/:code`)

Só host. Só se `status === 'waiting'`.

- [ ] `services/rooms.ts` → `cancelarSala(code: string)`
- [ ] `WaitingRoom.tsx` → quando `isHost`, mostrar botão "Cancelar sala" (estilo `btn` vermelho)
- [ ] Após cancelar, `router.push('/lobby')`

### 2.3 Upload de PDF — tema "Minha apostila"

Backend já aceita multipart em `POST /api/questions/generate` (`file` field) — só falta UI.

**⚠️ Atenção**: `apiFetch` força `Content-Type: application/json`, então **não dá pra usar pra multipart**. Precisa de fetch direto.

- [ ] Criar helper `services/api.ts` → `apiFetchMultipart(endpoint, formData)` que NÃO seta `Content-Type` (browser injeta `multipart/form-data; boundary=…`)
- [ ] `services/rooms.ts` → `gerarComPdf(roomCode: string, file: File): Promise<{ message, duelId, questionsGenerated }>`
- [ ] `components/room/CreateRoomForm.tsx` → quando `temaSelecionado.id === 'apostila'`, mostrar `<input type="file" accept="application/pdf">`
- [ ] `app/room/create/page.tsx` → no `handleCreate`, se tem PDF: cria sala normal, depois chama `gerarComPdf(salaCriada.code, file)`, depois `router.push(/room/${code})`
- [ ] Validar tamanho do arquivo no client (≤ 25 MB — limite do `client_max_body_size` do nginx)
- [ ] Estado de loading separado pra "Gerando questões com IA…" (a chamada Gemini leva 5-15s)

### Esboço do helper multipart
```ts
// services/api.ts (adicionar)
export async function apiFetchMultipart<T = unknown>(
  endpoint: string,
  formData: FormData,
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }))
    throw new Error(err.message || `Erro ${res.status}`)
  }
  return res.json()
}
```

### 2.4 Histórico de duelos (`GET /api/users/me/history`)

**Backend retorna**:
```ts
{
  items: Array<{
    roomCode: string
    theme: string | null
    finishedAt: string  // ISO
    score: number
    correct: number
    totalQuestions: number
    isWinner: boolean
  }>
  nextCursor: string | null  // pra paginação
}
```

- [ ] `services/users.ts` → `meuHistorico(cursor?: string, limit = 20)`
- [ ] `app/profile/page.tsx` → seção "Últimos duelos" abaixo do `ProfileCard`
- [ ] Novo componente `components/profile/HistoricoDuelos.tsx` com lista doodle (badge verde se `isWinner`)
- [ ] Botão "Carregar mais" usando `nextCursor`

---

## 🔌 Fase 3 — WebSocket (substituir polling) — **Backend PRONTO ✅**

Hoje `app/room/[id]/page.tsx:60-71` faz `obterSala()` a cada 3s. Backend já tem o `RoomsGateway` no ar; falta plugar no front.

### Conexão (já está no `.env.local`)
```env
NEXT_PUBLIC_WS_URL=https://dyotech.shop
```
- **path**: `/api/socket.io` (já passa pelo nginx existente, sem precisar mudar conf)
- **auth**: enviar JWT em `auth: { token }` no handshake (mesmo token do Bearer das chamadas REST)

### Eventos confirmados (implementados no backend)

| Direção | Evento | Payload |
|---|---|---|
| C→S | `room:join` | `{ code: string }` — server faz `socket.join('room:CODE')` e responde com `room:state` |
| C→S | `room:leave` | `{ code: string }` |
| S→C | `room:state` | `SalaDetalhe` completo (mesmo shape do `GET /api/rooms/:code`) |
| S→C | `room:player-joined` | `PlayerInfo` (o player que acabou de entrar) |
| S→C | `room:player-left` | `{ playerId: string }` |
| S→C | `duel:start` | `{ totalRounds: number }` |
| S→C | `question:result` | `{ questionId, answeredBy, isCorrect, correctAnswer, scoreboard: PlayerInfo[] }` |
| S→C | `duel:finished` | `{ winnerId: string \| null, scoreboard: PlayerInfo[] }` |
| S→C | `room:cancelled` | `{ code }` — host cancelou ou ficou sozinho e saiu |
| S→C | `room:error` | `{ message }` — falha de carregamento (ex: sala inexistente após `room:join`) |

### Trabalho no frontend

- [x] Adicionar `NEXT_PUBLIC_WS_URL` no `.env.local` (já feito pelo Claude)
- [ ] Criar `lib/hooks/useRoomSocket.ts`:
  ```ts
  import { useEffect, useRef, useState } from 'react'
  import { io, type Socket } from 'socket.io-client'
  import type { SalaDetalhe, PlayerInfo, AnswerResponse } from '@/services/rooms'

  export function useRoomSocket(code: string, token: string | null) {
    const [sala, setSala] = useState<SalaDetalhe | null>(null)
    const [conectado, setConectado] = useState(false)
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
      if (!token || !code) return
      const s = io(process.env.NEXT_PUBLIC_WS_URL!, {
        path: '/api/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
      })
      socketRef.current = s

      s.on('connect', () => {
        setConectado(true)
        s.emit('room:join', { code })
      })
      s.on('disconnect', () => setConectado(false))

      s.on('room:state', (state: SalaDetalhe) => setSala(state))
      s.on('room:cancelled', () => setSala(null)) // redirecionar pra /lobby na page

      return () => {
        s.emit('room:leave', { code })
        s.disconnect()
        socketRef.current = null
      }
    }, [code, token])

    return { sala, conectado, socket: socketRef.current }
  }
  ```
- [ ] `app/room/[id]/page.tsx`:
  - apagar o `setInterval` de polling (~linhas 60-71)
  - manter o `entrarSala()` REST inicial pra inserir o `RoomPlayer` no DB
  - depois disso, usar `useRoomSocket(code, token)` pro estado reativo
  - `handleAnswer` continua via REST (`responderPergunta`); o backend emite `question:result` pra todos os sockets da sala
  - escutar `room:cancelled` → toast + `router.push('/lobby')`
- [ ] Tratar `disconnect` (`conectado === false`) com banner "Conexão perdida, reconectando…" — o socket.io reconecta sozinho
- [ ] Validar: ao abrir `/room/CODE` em duas abas (mesmo user OU users diferentes), uma ação numa aba reflete na outra sem polling.

---

## 🎬 Fase 4 — Intro animada VS

Aproveitar a animação que já existe em `app/duel/[id]/page.tsx` (P1 entra → VS → P2 entra → FIGHT) como **transição** do `waiting` pro `playing` na sala.

- [ ] Mover lógica pra `components/room/DuelIntro.tsx`
- [ ] Aceitar props `players: PlayerInfo[]` e `onComplete: () => void`
- [ ] Remover dados mockados (`JOGADOR_ATUAL`, `OPONENTE`, mocks de rank/pontos)
- [ ] `app/room/[id]/page.tsx`: quando `sala.status` mudar de `'waiting'` pra `'playing'`, mostrar `<DuelIntro>` por ~7s antes de renderizar o `<QuestionCard>`
- [ ] Apagar `app/duel/[id]/page.tsx`

---

## ♻️ Fase 4.2 — Refresh token (opcional, recomendado)

JWT expira em 1d → user é deslogado meia-noite.

**Rota backend** (quando existir):
- `POST /api/auth/refresh` → body `{ refreshToken: string }` → retorna `{ access_token, refreshToken }`

- [ ] No `services/auth.ts`, salvar `refreshToken` ao logar (`localStorage.setItem('refreshToken', …)`)
- [ ] `services/api.ts` → adicionar interceptor: se `res.status === 401`, tentar `/auth/refresh` 1× e refazer request
- [ ] Se o refresh falhar, `useAuthStore.logout()` + redirect pra `/auth/login`

---

## 👥 Fase 4.3 — Sistema de amigos + Chat — **Backend PRONTO ✅**

Hoje `components/social/FriendsChatPanel.tsx` é 100% mock (`AMIGOS_MOCK`, `MENSAGENS_POR_AMIGO`). Backend agora tem **17 rotas REST + 5 eventos WS** prontos pra plugar. O painel pode parar de ser mock e virar real.

### 🔌 Conexão WebSocket separada do gateway de duelos

O chat usa um namespace **próprio** no socket.io, não o mesmo do `useRoomSocket`. Isso permite manter um único socket conectado pro app inteiro (notificações de amizade + DMs em qualquer tela), sem depender do user estar numa sala.

```ts
// lib/hooks/useChatSocket.ts (criar)
const s = io(process.env.NEXT_PUBLIC_WS_URL!, {
  path: '/api/socket.io',
  // ⚠️ Note o "/chat" no host — namespace, não path
})
// equivalente:
const s = io(process.env.NEXT_PUBLIC_WS_URL! + '/chat', {
  path: '/api/socket.io',
  auth: { token },
  transports: ['websocket', 'polling'],
})
```

### 📡 Rotas REST disponíveis

#### Amizades (`services/friends.ts` — criar)

| Método | Path | Body / Query | Retorno |
|---|---|---|---|
| `GET` | `/api/friends/search?q=tag&limit=10` | — | `Array<{id, name, tag, globalXp}>` (prefix match em tag) |
| `GET` | `/api/friends` | — | `Array<{friendshipId, since, id, name, tag, globalXp}>` |
| `POST` | `/api/friends/requests` | `{ tag: string }` | `Friendship` — pode ser `pending` ou `accepted` se eles já tinham mandado pedido pra você |
| `GET` | `/api/friends/requests/incoming` | — | `Array<{id, createdAt, from: {id, name, tag, globalXp}}>` |
| `GET` | `/api/friends/requests/outgoing` | — | `Array<{id, createdAt, to: {id, name, tag, globalXp}}>` |
| `POST` | `/api/friends/requests/:id/accept` | — | `Friendship` (status=accepted) |
| `POST` | `/api/friends/requests/:id/reject` | — | `Friendship` (status=rejected) |
| `DELETE` | `/api/friends/:userId` | — | `{ ok: true }` (remove amizade ou pedido pendente) |

Comportamentos a saber:
- Mandar pedido pra alguém que já te mandou → **auto-aceita** (sem você ter que clicar)
- Mandar pedido duplicado → 409
- Mandar pra você mesmo → 400
- Pedido `rejected` pode ser reenviado (vira `pending` de novo)

#### Conversas + mensagens (`services/chat.ts` — criar)

| Método | Path | Body / Query | Retorno |
|---|---|---|---|
| `GET` | `/api/conversations` | — | `Array<Conversation>` (ordenado por última mensagem desc) |
| `GET` | `/api/conversations/:id` | — | `Conversation` (com `members`, `lastMessage`) |
| `POST` | `/api/conversations/dm` | `{ userId: string }` | `Conversation` (idempotente — recupera DM existente, só amigos) |
| `POST` | `/api/conversations/group` | `{ name, memberIds: string[] }` | `Conversation` (criador vira admin) |
| `POST` | `/api/conversations/:id/members` | `{ userId }` | `Conversation` (só admin de grupo) |
| `DELETE` | `/api/conversations/:id/members/:userId` | — | `{ ok, status: 'removed' \| 'group-deleted' }` (self-remove ou admin removendo) |
| `GET` | `/api/conversations/:id/messages?cursor=&limit=30` | — | `{ items: Message[], nextCursor: string \| null }` |
| `POST` | `/api/conversations/:id/messages` | `{ text: string }` (≤2000 chars) | `Message` — broadcast WS automático |
| `POST` | `/api/conversations/:id/read` | `{ lastMessageId: string }` | `{ ok }` — atualiza `lastReadAt` + broadcast `chat:read` |

#### Tipos esperados (espelhar em `services/chat.ts`)

```ts
export interface ChatUser {
  id: string; name: string; tag: string; globalXp: number;
}
export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  author: { id: string; name: string; tag: string };
  text: string;
  sentAt: string; // ISO
  editedAt: string | null;
}
export interface ConversationMemberView extends ChatUser {
  role: 'member' | 'admin';
  joinedAt: string;
  lastReadAt: string | null;
}
export interface Conversation {
  id: string;
  type: 'dm' | 'group';
  title: string | null;     // pra DM, é o nome do outro user
  name: string | null;      // só preenchido pra grupo
  createdById: string | null;
  createdAt: string;
  members: ConversationMemberView[];
  lastMessage: Message | null;
  unread: number;
  myLastReadAt: string | null;
}
```

### 📡 Eventos WebSocket (namespace `/chat`)

#### Cliente → Servidor

| Evento | Payload | Quando emitir |
|---|---|---|
| `chat:join` | `{ conversationId: string }` | Ao abrir uma conversa (entra na sala socket pra receber `chat:message`) |
| `chat:leave` | `{ conversationId: string }` | Ao fechar a tela da conversa |
| `chat:typing` | `{ conversationId, isTyping: boolean }` | Debounced (~600ms) enquanto user digita |

#### Servidor → Cliente

| Evento | Payload | Onde mostrar |
|---|---|---|
| `friend:request-received` | `{ id, from: ChatUser }` | Toast "fulano te adicionou" + badge na lista de pedidos |
| `friend:request-accepted` | `{ id, by: ChatUser }` | Toast "fulano aceitou seu pedido" |
| `chat:conversation-updated` | `Conversation` completa | Atualizar lista de conversas (nova DM, novo grupo, novo membro) |
| `chat:message` | `{ conversationId, message: Message }` | Append na lista da conversa aberta + bumpar lista lateral |
| `chat:read` | `{ conversationId, userId, lastMessageId }` | Mostrar "visto" na bolha da mensagem |
| `chat:typing` | `{ conversationId, userId, isTyping }` | Indicador "fulano digitando…" |
| `chat:removed-from` | `{ conversationId }` | Tirar conversa da lista local |
| `chat:error` | `{ message }` | Toast de erro |

### 🛠️ Trabalho no frontend (substituir o mock)

- [ ] Apagar `AMIGOS_MOCK`, `GRUPOS_MOCK`, `MENSAGENS_POR_AMIGO` em `components/social/FriendsChatPanel.tsx`
- [ ] Criar `services/friends.ts` espelhando as 8 rotas acima
- [ ] Criar `services/chat.ts` espelhando as 9 rotas acima
- [ ] Criar `lib/hooks/useChatSocket.ts`:
  ```ts
  import { useEffect, useRef, useState, useCallback } from 'react'
  import { io, type Socket } from 'socket.io-client'
  import type { Conversation, Message } from '@/services/chat'
  import type { ChatUser } from '@/services/chat'

  type Handlers = {
    onMessage?: (e: { conversationId: string; message: Message }) => void
    onConversationUpdated?: (conv: Conversation) => void
    onFriendRequestReceived?: (e: { id: string; from: ChatUser }) => void
    onFriendRequestAccepted?: (e: { id: string; by: ChatUser }) => void
    onTyping?: (e: { conversationId: string; userId: string; isTyping: boolean }) => void
    onRead?: (e: { conversationId: string; userId: string; lastMessageId: string }) => void
  }

  export function useChatSocket(token: string | null, handlers: Handlers) {
    const socketRef = useRef<Socket | null>(null)
    const [conectado, setConectado] = useState(false)

    useEffect(() => {
      if (!token) return
      const s = io(process.env.NEXT_PUBLIC_WS_URL! + '/chat', {
        path: '/api/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
      })
      socketRef.current = s
      s.on('connect', () => setConectado(true))
      s.on('disconnect', () => setConectado(false))

      if (handlers.onMessage) s.on('chat:message', handlers.onMessage)
      if (handlers.onConversationUpdated) s.on('chat:conversation-updated', handlers.onConversationUpdated)
      if (handlers.onFriendRequestReceived) s.on('friend:request-received', handlers.onFriendRequestReceived)
      if (handlers.onFriendRequestAccepted) s.on('friend:request-accepted', handlers.onFriendRequestAccepted)
      if (handlers.onTyping) s.on('chat:typing', handlers.onTyping)
      if (handlers.onRead) s.on('chat:read', handlers.onRead)

      return () => { s.disconnect(); socketRef.current = null }
    }, [token])

    const joinConv = useCallback((id: string) => socketRef.current?.emit('chat:join', { conversationId: id }), [])
    const leaveConv = useCallback((id: string) => socketRef.current?.emit('chat:leave', { conversationId: id }), [])
    const setTyping = useCallback((id: string, isTyping: boolean) => socketRef.current?.emit('chat:typing', { conversationId: id, isTyping }), [])

    return { conectado, joinConv, leaveConv, setTyping, socket: socketRef.current }
  }
  ```
- [ ] Conectar o `useChatSocket` no nível do **layout autenticado** (ex.: dentro de `Sidebar` ou wrapper de `/lobby`, `/profile`, `/ranking`) pra receber notificações em qualquer tela
- [ ] `FriendsChatPanel.tsx`:
  - Carregar amigos via `GET /api/friends`
  - Carregar conversas via `GET /api/conversations` (substitui `AMIGOS_MOCK` + `GRUPOS_MOCK`)
  - Ao clicar em amigo sem DM aberta → `POST /api/conversations/dm { userId }`
  - Ao abrir uma conversa: `chatSocket.joinConv(id)`, `GET /api/conversations/:id/messages?limit=30`, ao chegar `chat:message` da conversa atual, dar `POST /api/conversations/:id/read { lastMessageId }`
  - Input de mensagem: `POST /api/conversations/:id/messages { text }` (não emita `chat:message` direto — o backend faz o broadcast)
  - Tela de "adicionar amigo": `GET /api/friends/search?q=` (prefix match em tag) → botão "adicionar" → `POST /api/friends/requests { tag }`
  - Lista de pedidos: `GET /api/friends/requests/incoming` + accept/reject

### Tela de notificações (sugestão)

- Ouvir `friend:request-received` → toast clicável que leva pra lista de pedidos
- Ouvir `friend:request-accepted` → toast "fulano aceitou seu pedido"
- Ouvir `chat:message` quando a conversa atual NÃO está aberta → toast + badge no painel

---

## 🚨 Páginas de erro (quick win)

- [ ] Criar `app/not-found.tsx` com mascote Valdo confuso
- [ ] Criar `app/error.tsx` com Valdo trist + botão "Tentar de novo"

---

## ✅ Checklist de validação ao final de cada fase

Quando terminar uma fase, valide:

1. `npm run lint` sem warnings novos
2. Fluxo manual no browser:
   - Login → Lobby → Criar sala → Sala → Iniciar → Responder → Resultado
   - Login → Perfil → Editar → Logout → Login (verificar se mudanças persistem)
3. Network tab: nenhuma chamada batendo em `localhost:3001` ou `34.169.108.126:3001` — tudo deve ir pra `https://dyotech.shop/api`
4. WS (Fase 3): conexão vista no DevTools → Network → WS, com mensagens trocadas

---

## 📞 Quando travar

- **Rota retorna 404** → confirma que está com `/api` no prefix (vide `services/api.ts`, `API_URL = …/api`)
- **CORS error** → backend precisa ter o origin no `CORS_ORIGINS` (`backend/docker-compose.yml`); pra dev local adicione `http://localhost:3000`
- **WS não conecta** → checa se nginx tem header `Upgrade` no path certo + se o JWT tá sendo enviado em `auth.token` (não em header)
- **Multipart 413 Request Entity Too Large** → arquivo > 25 MB; aumenta `client_max_body_size` no nginx (precisa root)

---

*Última revisão do mapa: 2026-04-28 — pareie com Dyone antes de começar a Fase 3 pra alinhar nomes dos eventos.*
