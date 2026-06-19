'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogoMark } from '@/components/ui/LogoMark'
import { WaitingRoom } from '@/components/room/WaitingRoom'
import { QuestionCard } from '@/components/room/QuestionCard'
import { GameResults } from '@/components/room/GameResults'
import { VsIntro } from '@/components/room/VsIntro'
import { PlacarAoVivo } from '@/components/room/PlacarAoVivo'
import type { PlayerInfo as VsPlayerInfo } from '@/components/room/PlayerSideCard'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useAuthStore } from '@/lib/store/useAuthStore'
import {
  obterSala,
  entrarSala,
  iniciarPartida,
  responderPergunta,
  obterMinhasRespostas,
  sairSala,
  cancelarSala,
  type SalaDetalhe,
  type PlayerInfo,
} from '@/services/rooms'
import { getRoomsSocket } from '@/services/socket'

// Cores dos cards da intro VS — eu sempre azul, oponente rosa.
function paraVsPlayer(p: PlayerInfo, cor: string): VsPlayerInfo {
  return {
    apelido: p.name,
    rank: p.isBot ? 'BOT' : `@${p.tag}`,
    pontos: p.score,
    cor,
    inicial: (p.name || '?').charAt(0).toUpperCase(),
  }
}

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
  const [aguardandoFim, setAguardandoFim] = useState(false)
  const [mostrarIntro, setMostrarIntro] = useState(false)
  const [statusVisto, setStatusVisto] = useState<string | null>(null)

  // Detecta a transição waiting → playing DURANTE o render (padrão React de
  // estado derivado) pra disparar a intro VS quando o duelo é 1v1.
  if (sala && sala.status !== statusVisto) {
    setStatusVisto(sala.status)
    if (statusVisto === 'waiting' && sala.status === 'playing' && sala.players.length === 2) {
      setMostrarIntro(true)
    }
  }

  // Carregar sala e tentar entrar
  useEffect(() => {
    if (authCarregando || !user) return

    // Reload no meio da partida: descobre quais perguntas já foram
    // respondidas e retoma da primeira pendente (sem isso o jogador
    // re-responderia a pergunta 1 e levaria 409).
    async function retomarProgresso(data: SalaDetalhe) {
      if (data.status !== 'playing' || !data.questions?.length) return
      try {
        const { answers } = await obterMinhasRespostas(code)
        if (answers.length === 0) return
        const respondidas = new Set(answers.map((a) => a.questionId))
        const primeiraPendente = data.questions.findIndex((q) => !respondidas.has(q.id))
        if (primeiraPendente === -1) {
          setAguardandoFim(true)
        } else {
          setPerguntaAtual(primeiraPendente)
        }
      } catch {
        // Sem retomada — segue do início; o backend barra duplicatas.
      }
    }

    async function loadAndJoin() {
      try {
        // Tentar entrar na sala
        let data: SalaDetalhe
        try {
          data = await entrarSala(code)
        } catch {
          // Já está na sala ou outro erro — buscar dados
          data = await obterSala(code)
        }
        setSala(data)
        setJoined(true)
        await retomarProgresso(data)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar sala.')
      } finally {
        setCarregando(false)
      }
    }

    loadAndJoin()
  }, [code, authCarregando, user])

  // Tempo real via WebSocket (substitui o antigo polling de 3s). O gateway
  // emite "room:state" a cada mudança — entrar/sair, iniciar, resultado de
  // pergunta e fim do duelo — então o estado fica sempre sincronizado.
  useEffect(() => {
    if (!joined) return
    const socket = getRoomsSocket()

    const onState = (state: SalaDetalhe) => setSala(state)
    const onCancelled = () => {
      setErro('A sala foi cancelada pelo host.')
      setSala(null)
    }
    const onError = (e: { message?: string }) => {
      if (e?.message) setErro(e.message)
    }
    const entrar = () => socket.emit('room:join', { code })

    socket.on('room:state', onState)
    socket.on('room:cancelled', onCancelled)
    socket.on('room:error', onError)
    // Reentra na sala a cada (re)conexão pra não perder o broadcast.
    socket.on('connect', entrar)
    if (socket.connected) entrar()

    return () => {
      socket.emit('room:leave', { code })
      socket.off('room:state', onState)
      socket.off('room:cancelled', onCancelled)
      socket.off('room:error', onError)
      socket.off('connect', entrar)
    }
  }, [joined, code])

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

  const [saindo, setSaindo] = useState(false)

  const handleSair = useCallback(async () => {
    setSaindo(true)
    try {
      await sairSala(code)
      router.push('/lobby')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao sair da sala.')
      setSaindo(false)
    }
  }, [code, router])

  const handleCancelar = useCallback(async () => {
    setSaindo(true)
    try {
      await cancelarSala(code)
      router.push('/lobby')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cancelar a sala.')
      setSaindo(false)
    }
  }, [code, router])

  async function handleAnswer(questionId: string, answer: string) {
    return responderPergunta(code, questionId, answer)
  }

  function handleNextQuestion() {
    if (!sala?.questions) return
    if (perguntaAtual + 1 >= sala.questions.length) {
      // Terminou suas perguntas. A sala só fica "finished" quando todos
      // acabam — o socket ("room:state") cuida de atualizar. Enquanto isso,
      // mostramos a tela de espera.
      setAguardandoFim(true)
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

  // Jogadores da intro VS: eu na esquerda, oponente na direita.
  const meuPlayer = sala.players.find((p) => p.id === user?.id)
  const oponente = sala.players.find((p) => p.id !== user?.id)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <header
        className="roomid-header"
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
        <div className="roomid-chips" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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

      <main className="roomid-main" style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 60px' }}>
        {sala.status === 'waiting' && (
          <WaitingRoom
            code={sala.code}
            theme={sala.theme}
            players={sala.players}
            maxPlayers={sala.maxPlayers}
            isHost={isHost}
            onStart={handleStart}
            iniciando={iniciando}
            onSair={handleSair}
            onCancelar={handleCancelar}
            saindo={saindo}
          />
        )}

        {sala.status === 'playing' && mostrarIntro && meuPlayer && oponente && (
          <VsIntro
            jogador1={paraVsPlayer(meuPlayer, '#1B4FBE')}
            jogador2={paraVsPlayer(oponente, '#DB2777')}
            onFim={() => setMostrarIntro(false)}
          />
        )}

        {sala.status === 'playing' && !mostrarIntro && !aguardandoFim && (
          <PlacarAoVivo players={sala.players} meuId={user?.id || null} />
        )}

        {sala.status === 'playing' && !mostrarIntro && !aguardandoFim && sala.questions && sala.questions[perguntaAtual] && (
          <QuestionCard
            // key remonta o card a cada pergunta — reseta seleção, resultado e timer.
            key={sala.questions[perguntaAtual].id}
            question={sala.questions[perguntaAtual]}
            questionNumber={perguntaAtual + 1}
            totalQuestions={sala.questions.length}
            tempoPorPergunta={sala.questionTime || 20}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
          />
        )}

        {sala.status === 'playing' && aguardandoFim && (
          <div className="doodle-card" style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 20, margin: 0 }}>
              Você terminou! 🎉
            </p>
            <p style={{ color: 'var(--muted)', fontWeight: 700, marginTop: 10 }}>
              Aguardando os outros jogadores finalizarem...
            </p>
          </div>
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
