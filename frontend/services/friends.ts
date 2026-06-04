import { apiFetch } from './api'

// Tipos espelham a serialização do backend (friends.service.ts).

export interface Amigo {
  friendshipId: string
  since: string
  id: string
  name: string
  tag: string
  globalXp: number
}

export interface UsuarioBusca {
  id: string
  name: string
  tag: string
  globalXp: number
}

export interface PedidoRecebido {
  id: string
  createdAt: string
  from: UsuarioBusca
}

export interface PedidoEnviado {
  id: string
  createdAt: string
  to: UsuarioBusca
}

/** Busca usuários por prefixo de tag (case-insensitive). */
export async function buscarUsuarios(q: string): Promise<UsuarioBusca[]> {
  return apiFetch<UsuarioBusca[]>(`/friends/search?q=${encodeURIComponent(q)}`)
}

export async function listarAmigos(): Promise<Amigo[]> {
  return apiFetch<Amigo[]>('/friends')
}

/** Envia pedido por tag. Idempotente — se o outro já pediu, vira amizade direto. */
export async function enviarPedido(tag: string): Promise<unknown> {
  return apiFetch('/friends/requests', {
    method: 'POST',
    body: JSON.stringify({ tag }),
  })
}

export async function listarPedidosRecebidos(): Promise<PedidoRecebido[]> {
  return apiFetch<PedidoRecebido[]>('/friends/requests/incoming')
}

export async function listarPedidosEnviados(): Promise<PedidoEnviado[]> {
  return apiFetch<PedidoEnviado[]>('/friends/requests/outgoing')
}

export async function aceitarPedido(requestId: string): Promise<unknown> {
  return apiFetch(`/friends/requests/${requestId}/accept`, { method: 'POST' })
}

export async function rejeitarPedido(requestId: string): Promise<unknown> {
  return apiFetch(`/friends/requests/${requestId}/reject`, { method: 'POST' })
}

export async function removerAmigo(userId: string): Promise<unknown> {
  return apiFetch(`/friends/${userId}`, { method: 'DELETE' })
}
