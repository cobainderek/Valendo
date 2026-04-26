'use client'

import { use, useEffect, useState } from 'react'
import { PlayerSideCard, type PlayerInfo } from '@/components/room/PlayerSideCard'
import { Valdo } from '@/components/ui/Valdo'

type Fase = 'player1' | 'player2' | 'vs' | 'fight' | 'jogando'

const JOGADOR_ATUAL: PlayerInfo = {
  apelido: 'derek_o_insup',
  rank: 'Ouro II',
  pontos: 1840,
  cor: '#1B4FBE',
  inicial: 'D',
}

const OPONENTE: PlayerInfo = {
  apelido: 'mari.04',
  rank: 'Ouro I',
  pontos: 1910,
  cor: '#DB2777',
  inicial: 'M',
}

export default function DuelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [fase, setFase] = useState<Fase>('player1')

  useEffect(() => {
    // P1 entra (0-1.5s) → pausa → VS aparece (2.2s) → P2 entra (4s) → FIGHT (6s)
    const t1 = setTimeout(() => setFase('vs'),      2200)
    const t2 = setTimeout(() => setFase('player2'), 4000)
    const t3 = setTimeout(() => setFase('fight'),   6200)
    const t4 = setTimeout(() => setFase('jogando'), 8000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  const p1Visivel = fase !== 'jogando'
  const p2Visivel = fase === 'player2' || fase === 'fight'
  const vsVisivel = fase === 'vs' || fase === 'player2'

  if (fase === 'jogando') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-page)',
          display: 'grid',
          placeItems: 'center',
          padding: 40,
        }}
      >
        <div className="doodle-card" style={{ padding: 40, textAlign: 'center', maxWidth: 520 }}>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: '-0.02em',
            }}
          >
            Duelo {id.slice(0, 6).toUpperCase()} começou
          </div>
          <div style={{ color: 'var(--muted)', fontWeight: 700, marginTop: 8 }}>
            (tela do duelo em tempo real — próxima etapa)
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 50% 50%, rgba(27,79,190,0.15), rgba(27,79,190,0) 60%), var(--bg-page)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        position: 'relative',
      }}
    >
      {/* Lado esquerdo — P1 entra primeiro */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {p1Visivel && (
          <div className="slide-in-left" style={{ width: '100%' }}>
            <PlayerSideCard jogador={JOGADOR_ATUAL} lado="esquerda" />
          </div>
        )}
      </div>

      {/* Lado direito — P2 entra só depois que P1 tá em posição */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {p2Visivel && (
          <div className="slide-in-right" style={{ width: '100%' }}>
            <PlayerSideCard jogador={OPONENTE} lado="direita" />
          </div>
        )}
      </div>

      {/* Valdo árbitro — topo da cena, apitando até o FIGHT */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '8%',
          transform: 'translateX(-50%)',
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      >
        <div className="valdo-ref-bob">
          <Valdo
            size={160}
            expression="idle"
            accessory="whistle"
            whistling
            tilt={0}
          />
        </div>
      </div>

      {/* Centro — VS ou FIGHT */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '55%',
          transform: 'translate(-50%, -50%)',
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {vsVisivel && (
          <div
            key="vs"
            className="vs-soft"
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 'clamp(72px, 9vw, 110px)',
              color: 'var(--accent)',
              WebkitTextStroke: '3px var(--ink)',
              textShadow: '4px 4px 0 var(--ink)',
              letterSpacing: '0.02em',
              lineHeight: 1.2,
              padding: '0 16px',
            }}
          >
            VS
          </div>
        )}
        {fase === 'fight' && (
          <div
            key="fight"
            className="fight-soft"
            style={{
              fontFamily: 'var(--font-hand)',
              fontWeight: 700,
              fontSize: 'clamp(84px, 10vw, 130px)',
              color: 'var(--red)',
              textShadow: '4px 4px 0 var(--ink)',
              lineHeight: 1.2,
              padding: '0 16px',
            }}
          >
            FIGHT!
          </div>
        )}
      </div>

      {/* Doodles decorativos no fundo */}
      {fase === 'fight' && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '18%',
              left: '8%',
              fontFamily: 'var(--font-hand)',
              fontSize: 48,
              color: 'var(--accent)',
              transform: 'rotate(-12deg)',
              opacity: 0.8,
            }}
            className="fade-slide-up"
          >
            ★
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '22%',
              right: '10%',
              fontFamily: 'var(--font-hand)',
              fontSize: 52,
              color: 'var(--orange)',
              transform: 'rotate(14deg)',
              opacity: 0.8,
            }}
            className="fade-slide-up"
          >
            ✦
          </div>
        </>
      )}
    </div>
  )
}
