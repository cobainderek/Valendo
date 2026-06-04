import { apiFetch } from './api'

export interface GeracaoPerguntasResposta {
  duelId?: string
  totalRounds?: number
  message?: string
}

/**
 * Gera as perguntas do duelo via Gemini. Só o host da sala pode chamar.
 * Com `arquivo` (PDF), as perguntas saem do material enviado; sem arquivo,
 * saem do tema. Pode demorar alguns segundos (chamada à IA).
 */
export async function gerarPerguntas(
  roomCode: string,
  arquivo?: File | null,
  theme?: string,
): Promise<GeracaoPerguntasResposta> {
  const form = new FormData()
  form.append('roomCode', roomCode)
  if (theme) form.append('theme', theme)
  if (arquivo) form.append('file', arquivo)

  return apiFetch<GeracaoPerguntasResposta>('/questions/generate', {
    method: 'POST',
    body: form,
  })
}
