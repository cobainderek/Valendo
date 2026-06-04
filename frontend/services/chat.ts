import { apiFetch } from './api'

// Tipos espelham a serialização do backend (chat.service.ts).
// IDs são BigInt no Prisma e chegam como string na API.

export interface MembroConversa {
  id: string
  name: string
  tag: string
  globalXp: number
  role: string
  joinedAt: string
  lastReadAt: string | null
}

export interface Mensagem {
  id: string
  conversationId: string
  authorId: string
  author: { id: string; name: string; tag: string }
  text: string
  sentAt: string
  editedAt: string | null
}

export interface Conversa {
  id: string
  type: 'dm' | 'group'
  /** Pra DM, o backend já resolve o nome do outro usuário. */
  title: string
  name: string | null
  createdById: string
  createdAt: string
  members: MembroConversa[]
  lastMessage: Mensagem | null
  unread: number
  myLastReadAt: string | null
}

export interface PaginaMensagens {
  items: Mensagem[]
  nextCursor: string | null
}

/** Lista conversas do usuário, com contagem de não lidas, ordenadas por atividade. */
export async function listarConversas(): Promise<Conversa[]> {
  return apiFetch<Conversa[]>('/conversations')
}

/** Abre (ou retorna) a DM com um amigo. Exige amizade aceita. */
export async function abrirDm(userId: string): Promise<Conversa> {
  return apiFetch<Conversa>('/conversations/dm', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
}

export async function criarGrupo(name: string, memberIds: string[]): Promise<Conversa> {
  return apiFetch<Conversa>('/conversations/group', {
    method: 'POST',
    body: JSON.stringify({ name, memberIds }),
  })
}

export async function obterConversa(conversationId: string): Promise<Conversa> {
  return apiFetch<Conversa>(`/conversations/${conversationId}`)
}

/** Mensagens em ordem decrescente (mais recente primeiro) com cursor pra paginar. */
export async function listarMensagens(
  conversationId: string,
  cursor?: string,
  limit = 50,
): Promise<PaginaMensagens> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set('cursor', cursor)
  return apiFetch<PaginaMensagens>(`/conversations/${conversationId}/messages?${params}`)
}

/** Envia mensagem (máx. 2000 chars). O backend também faz broadcast via socket. */
export async function enviarMensagem(conversationId: string, text: string): Promise<Mensagem> {
  return apiFetch<Mensagem>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export async function marcarLida(conversationId: string, lastMessageId: string): Promise<unknown> {
  return apiFetch(`/conversations/${conversationId}/read`, {
    method: 'POST',
    body: JSON.stringify({ lastMessageId }),
  })
}
