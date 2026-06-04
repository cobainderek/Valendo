import { apiFetch } from './api'

// Tipos espelham a serialização do backend (users.service.ts).

export interface EstatisticasPerfil {
  roomsHosted: number
  duelsPlayed: number
  duelsWon: number
  correctAnswersTotal: number
}

export interface PerfilCompleto {
  id: string
  name: string
  tag: string
  email: string
  globalXp: number
  role?: string
  createdAt?: string
  stats: EstatisticasPerfil
}

export interface DueloHistorico {
  roomCode: string
  theme: string | null
  finishedAt: string | null
  score: number
  correct: number
  totalQuestions: number
  isWinner: boolean
}

export interface PaginaHistorico {
  items: DueloHistorico[]
  nextCursor: string | null
}

export interface AtualizarPerfilDTO {
  name?: string
  tag?: string
  /** Obrigatória quando newPassword é enviada. */
  currentPassword?: string
  newPassword?: string
}

/** Perfil do usuário logado com estatísticas agregadas. */
export async function obterMeuPerfil(): Promise<PerfilCompleto> {
  return apiFetch<PerfilCompleto>('/users/me')
}

/** Atualiza nome/tag/senha. Devolve o perfil atualizado. */
export async function atualizarMeuPerfil(dto: AtualizarPerfilDTO): Promise<PerfilCompleto> {
  return apiFetch<PerfilCompleto>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}

/** Histórico de duelos finalizados, paginado por cursor. */
export async function obterMeuHistorico(
  cursor?: string | null,
  limit = 20,
): Promise<PaginaHistorico> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set('cursor', cursor)
  return apiFetch<PaginaHistorico>(`/users/me/history?${params}`)
}
