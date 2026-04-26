import { apiFetch } from './api'

export interface RankingEntry {
  pos: number
  tag: string
  name: string
  xp: number
}

export async function buscarRankingSemanal(limit: number = 10): Promise<RankingEntry[]> {
  return apiFetch<RankingEntry[]>(`/ranking/weekly?limit=${limit}`)
}
