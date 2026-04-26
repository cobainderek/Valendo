'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogoMark } from '@/components/ui/LogoMark'
import { WaitingRoom } from '@/components/room/WaitingRoom'
import { QuestionCard } from '@/components/room/QuestionCard'
import { GameResults } from '@/components/room/GameResults'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useAuthStore } from '@/lib/store/useAuthStore'
import {
  obterSala,
  entrarSala,
  iniciarPartida,
  responderPergunta,
  type SalaDetalhe,
} from '@/services/rooms'

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { carregando: authCarregando } = useAuthGuard()
  const { id: code } = use(params)
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const [sala, setSala] = useState<SalaDetalhe | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [iniciando, setIniciando] = useState(false)
  const [erro, setErro] = useState('')
  const [perguntaAtual, setPerguntaAtual] = useState(0)
  const [joined, setJoined] = useState(false)

  // Carregar sala e tentar entrar
  useEffect(() => {
    if (authCarregando || !user) return

    async function loadAndJoin() {
      try {
        // Tentar entrar na sala
        try {
          const data = await entrarSala(code)
          setSala(data)
          setJoined(true)
        } catch {
          // Já está na sala ou outro erro — buscar dados
          const data = await obterSala(code)
          setSala(data)
          setJoined(true)
        }
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar sala.')
      } finally {
        setCarregando(false)
      }
    }

    loadAndJoin()
  }, [code, authCarregando, user])

  // Polling: atualizar dados da sala a cada 3s enquanto waiting
  useEffect(() => {
    if (!sala || sala.status !== 'waiting') return

    const interval = setInterval(async () => {
      try {
        const data = await obterSala(code)
        setSala(data)
      } catch { /* silencioso */ }
    }, 3000)

    return () => clearInterval(interval)
  }, [sala?.status, code])

  // Quando status muda para playing, recarregar para ter as perguntas
  useEffect(() => {
    if (sala?.status === 'playing' && (!sala.questions || sala.questions.length === 0)) {
      obterSala(code).then(setSala).catch(() => {})
    }
  }, [sala?.status, code])

  const handleStart = useCallback(async () => {
    setIniciando(true)
    setErro('')
    try {
      const data = await iniciarPartida(code)
      setSala(data)
      setPerguntaAtual(0)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao iniciar partida.')
    } finally {
      setIniciando(false)
    }
  }, [code])

  async function handleAnswer(questionId: string, answer: string) {
    return responderPergunta(code, questionId, answer)
  }

  function handleNextQuestion() {
    if (!sala?.questions) return
    if (perguntaAtual + 1 >= sala.questions.length) {
      // Recarregar para ver resultado final
      obterSala(code).then(setSala).catch(() => {})
    } else {
      setPerguntaAtual((p) => p + 1)
    }
  }

  if (authCarregando || carregando) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'grid', placeItems: 'center' }}>
        <p style={{ fontWeight: 700, color: 'var(--muted)' }}>Carregando sala...</p>
      </div>
    )
  }

  if (erro || !sala) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, color: 'var(--red)', fontSize: 18, marginBottom: 16 }}>
            {erro || 'Sala não encontrada.'}
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/lobby')}>Voltar ao lobby</button>
        </div>
      </div>
    )
  }

  const isHost = user?.id === sala.hostId

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '2.5px solid var(--ink)',
          background: 'var(--bg-card)',
        }}
      >
        <a href="/lobby" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--primary-dark)' }}>
          <LogoMark />
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 20, letterSpacing: '-0.02em' }}>
            Valendo
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="chip" style={{ background: 'var(--primary-soft)' }}>
            sala #{sala.code}
          </span>
          <span
            className="chip"
            style={{
              borderColor: sala.status === 'playing' ? 'var(--green)' : sala.status === 'finished' ? 'var(--muted)' : 'var(--accent)',
              color: sala.status === 'playing' ? 'var(--green)' : sala.status === 'finished' ? 'var(--muted)' : 'var(--accent)',
            }}
          >
            {sala.status === 'waiting' ? 'Aguardando' : sala.status === 'playing' ? 'Em jogo' : 'Finalizado'}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 60px' }}>
        {sala.status === 'waiting' && (
          <WaitingRoom
            code={sala.code}
            theme={sala.theme}
            players={sala.players}
            maxPlayers={sala.maxPlayers}
            isHost={isHost}
            onStart={handleStart}
            iniciando={iniciando}
          />
        )}

        {sala.status === 'playing' && sala.questions && sala.questions[perguntaAtual] && (
          <QuestionCard
            question={sala.questions[perguntaAtual]}
            questionNumber={perguntaAtual + 1}
            totalQuestions={sala.questions.length}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
          />
        )}

        {sala.status === 'finished' && (
          <GameResults
            players={sala.players}
            winnerId={sala.winnerId}
            meuId={user?.id || null}
            totalQuestions={sala.totalRounds || 10}
            onVoltar={() => router.push('/lobby')}
          />
        )}

        {erro && (
          <div style={{ marginTop: 16, padding: '10px 14px', background: '#FEE2E2', border: '2px solid var(--red)', borderRadius: 10, color: 'var(--red)', fontWeight: 700, fontSize: 13 }}>
            {erro}
          </div>
        )}
      </main>
    </div>
  )
}
