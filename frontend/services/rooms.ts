import { apiFetch } from './api'

export interface SalaAPI {
  id: string
  code: string
  hostId: string
  theme: string | null
  status: string
  isPrivate: boolean
  maxPlayers: number
  playerCount: number
  host: {
    name: string
    tag: string
    globalXp: number
  }
}

export interface CriarSalaDTO {
  theme?: string
  isPrivate?: boolean
  maxPlayers?: number
  isSoloMode?: boolean
}

export interface SalaCriadaAPI {
  id: string
  code: string
  hostId: string
  theme: string | null
  status: string
  isPrivate: boolean
  maxPlayers: number
}

export interface PlayerInfo {
  id: string
  tag: string
  name: string
  score: number
  correct: number
  finished: boolean
  isBot?: boolean
}

export interface QuestionInfo {
  id: string
  text: string
  options: string[]
  explanationAi?: string
}

export interface SalaDetalhe {
  id: string
  code: string
  hostId: string
  theme: string | null
  status: string
  maxPlayers: number
  startedAt: string | null
  finishedAt: string | null
  winnerId: string | null
  isSoloMode: boolean
  players: PlayerInfo[]
  host: { name: string; tag: string; globalXp: number }
  duelId?: string
  totalRounds?: number
  questions?: QuestionInfo[]
}

export interface AnswerResponse {
  isCorrect: boolean
  correctAnswer: string
  explanationAi: string | null
  xpEarned: number
  totalScore: number
}

export async function listarSalas(): Promise<SalaAPI[]> {
  return apiFetch<SalaAPI[]>('/rooms')
}

export async function criarSala(dados: CriarSalaDTO): Promise<SalaCriadaAPI> {
  return apiFetch<SalaCriadaAPI>('/rooms', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export async function obterSala(code: string): Promise<SalaDetalhe> {
  return apiFetch<SalaDetalhe>(`/rooms/${code}`)
}

export async function entrarSala(code: string): Promise<SalaDetalhe> {
  return apiFetch<SalaDetalhe>(`/rooms/${code}/join`, { method: 'POST' })
}

export async function iniciarPartida(code: string): Promise<SalaDetalhe> {
  return apiFetch<SalaDetalhe>(`/rooms/${code}/start`, { method: 'POST' })
}

export async function responderPergunta(
  code: string,
  questionId: string,
  selectedAnswer: string,
): Promise<AnswerResponse> {
  return apiFetch<AnswerResponse>(`/rooms/${code}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, selectedAnswer }),
  })
}
