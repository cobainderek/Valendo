'use client'

import { Valdo } from '@/components/ui/Valdo'
import { PlayerSideCard, type PlayerInfo } from '@/components/room/PlayerSideCard'

interface MatchmakingSplitProps {
  jogador: PlayerInfo
  oponente: PlayerInfo | null
  tempoDecorrido: number
}

function formatarTempo(seg: number) {
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MatchmakingSplit({ jogador, oponente, tempoDecorrido }: MatchmakingSplitProps) {
  return (
    <div
      className="mm-grid"
      style={{
        position: 'relative',
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 420,
      }}
    >
      {/* Metade esquerda — card aparece só após o handshake */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(90deg, rgba(27,79,190,0.10), rgba(27,79,190,0) 80%)',
        }}
      >
        {oponente && (
          <div className="slide-in-left" style={{ width: '100%', height: '100%' }}>
            <PlayerSideCard jogador={jogador} lado="esquerda" />
          </div>
        )}
      </div>

      {/* Metade direita — card do oponente só após o handshake */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(270deg, rgba(232,96,28,0.10), rgba(232,96,28,0) 80%)',
        }}
      >
        {oponente && (
          <div className="slide-in-right" style={{ width: '100%', height: '100%' }}>
            <PlayerSideCard jogador={oponente} lado="direita" />
          </div>
        )}
      </div>

      {/* Linha divisória doodle vertical */}
      <svg
        className="mm-divider"
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          transform: 'translateX(-50%)',
          height: '100%',
          width: 24,
          pointerEvents: 'none',
        }}
        viewBox="0 0 24 400"
        preserveAspectRatio="none"
      >
        <path
          d="M 12 0 q 6 50 -2 100 q -8 50 2 100 q 6 50 -2 100 q -8 50 2 100"
          stroke="#1A1A2E"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 6"
        />
      </svg>

      {/* Valdo árbitro no meio */}
      <div
        className="mm-valdo"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        <div className="valdo-ref-bob">
          <Valdo
            size={180}
            expression="idle"
            accessory="whistle"
            whistling
            tilt={0}
          />
        </div>

        {/* Timer + status */}
        <div
          className="doodle-card"
          style={{
            padding: '10px 18px',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 4 }}>
            <span
              className="animate-pulse-dot"
              style={{
                width: 9,
                height: 9,
                borderRadius: 999,
                background: 'var(--red)',
                display: 'inline-block',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 15,
              color: 'var(--ink)',
              letterSpacing: '-0.01em',
            }}
          >
            procurando oponente
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 15,
              color: 'var(--primary)',
              background: 'var(--primary-soft)',
              padding: '3px 10px',
              borderRadius: 8,
              border: '2px solid var(--ink)',
            }}
          >
            {formatarTempo(tempoDecorrido)}
          </span>
        </div>
      </div>
    </div>
  )
}
