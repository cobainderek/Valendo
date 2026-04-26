'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogoMark } from '@/components/ui/LogoMark'
import { MatchmakingSplit } from '@/components/room/MatchmakingSplit'
import { DicasCarousel } from '@/components/room/DicasCarousel'
import type { PlayerInfo } from '@/components/room/PlayerSideCard'

const JOGADOR_ATUAL: PlayerInfo = {
  apelido: 'derek_o_insup',
  rank: 'Ouro II',
  pontos: 1840,
  cor: '#1B4FBE',
  inicial: 'D',
}

const OPONENTE_MOCK: PlayerInfo = {
  apelido: 'mari.04',
  rank: 'Ouro I',
  pontos: 1910,
  cor: '#DB2777',
  inicial: 'M',
}

export default function MatchmakingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [tempo, setTempo] = useState(0)
  const [oponente, setOponente] = useState<PlayerInfo | null>(null)
  const [achou, setAchou] = useState(false)

  // Timer do matchmaking
  useEffect(() => {
    const t = setInterval(() => setTempo((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Simula encontrar oponente depois de ~12s (mock até backend entrar)
  useEffect(() => {
    const t = setTimeout(() => {
      setOponente(OPONENTE_MOCK)
      setAchou(true)
    }, 12000)
    return () => clearTimeout(t)
  }, [])

  // Depois que achou, dá um tempo pra pessoa ler e só então vai pro duelo
  useEffect(() => {
    if (!achou) return
    const t = setTimeout(() => {
      router.push(`/duel/${id}`)
    }, 3800)
    return () => clearTimeout(t)
  }, [achou, id, router])

  function handleCancelar() {
    if (confirm('Quer mesmo sair do matchmaking?')) router.push('/lobby')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        {/* Header */}
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
          <a
            href="/lobby"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: 'var(--primary-dark)',
            }}
          >
            <LogoMark />
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: '-0.02em',
              }}
            >
              Valendo
            </span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="chip" style={{ background: 'var(--primary-soft)' }}>
              sala #{id.slice(0, 6).toUpperCase()}
            </span>
            <button
              className="btn"
              onClick={handleCancelar}
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              cancelar
            </button>
          </div>
        </header>

        {/* Área central */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 32px',
            gap: 20,
          }}
        >
          <MatchmakingSplit
            jogador={JOGADOR_ATUAL}
            oponente={oponente}
            tempoDecorrido={tempo}
          />

          {achou && (
            <div
              className="sticker fade-slide-up"
              style={{
                alignSelf: 'center',
                fontSize: 16,
                padding: '10px 18px',
                background: 'var(--green)',
                color: '#fff',
              }}
            >
              oponente encontrado — preparando duelo…
            </div>
          )}

          <DicasCarousel />
        </main>
      </div>
    </div>
  )
}
