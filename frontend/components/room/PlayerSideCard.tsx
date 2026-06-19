'use client'

import { DoodleIcon } from '@/components/ui/DoodleIcon'

export interface PlayerInfo {
  apelido: string
  rank: string
  pontos: number
  cor: string
  inicial: string
}

interface PlayerSideCardProps {
  jogador: PlayerInfo | null
  lado: 'esquerda' | 'direita'
  procurando?: boolean
}

export function PlayerSideCard({ jogador, lado, procurando = false }: PlayerSideCardProps) {
  // Centraliza o card em cada metade — fica mais próximo do meio sem colar no VS
  const alignment = 'center'
  const textAlign = lado === 'esquerda' ? ('left' as const) : ('right' as const)
  const paddingSide = '0 16px'

  if (procurando || !jogador) {
    return (
      <div
        className="pside-wrap"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: alignment,
          justifyContent: 'center',
          gap: 18,
          padding: paddingSide,
        }}
      >
        <div
          className="pside-avatar animate-float"
          style={{
            width: 220,
            height: 220,
            borderRadius: 20,
            border: '3.5px dashed var(--muted)',
            background: 'rgba(255,255,255,0.5)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--muted)',
          }}
        >
          <DoodleIcon name="search" size={72} strokeColor="var(--muted)" />
        </div>
        <div style={{ textAlign }}>
          <div
            style={{
              fontFamily: 'var(--font-hand)',
              fontSize: 34,
              color: 'var(--muted)',
              lineHeight: 1,
            }}
          >
            procurando oponente
            <span className="animate-pulse-dot" style={{ display: 'inline-block', marginLeft: 6 }}>
              …
            </span>
          </div>
          <div
            style={{
              marginTop: 6,
              fontWeight: 800,
              fontSize: 13,
              color: 'var(--muted)',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            aguardando matchmaking
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="pside-wrap"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: alignment,
        justifyContent: 'center',
        gap: 16,
        padding: '0 48px',
      }}
    >
      <div
        className="doodle-card pside-avatar"
        style={{
          width: 240,
          height: 240,
          background: jogador.cor,
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="pside-initial"
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: 120,
            color: '#fff',
            textShadow: '4px 4px 0 var(--ink)',
            lineHeight: 1,
          }}
        >
          {jogador.inicial}
        </div>
        <div
          className="sticker"
          style={{
            position: 'absolute',
            top: 12,
            [lado === 'esquerda' ? 'right' : 'left']: 12,
            fontSize: 11,
          }}
        >
          {jogador.rank}
        </div>
      </div>
      <div style={{ textAlign }}>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: 26,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            lineHeight: 1,
          }}
        >
          {jogador.apelido}
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: 'var(--font-ui)',
            fontWeight: 800,
            fontSize: 14,
            color: 'var(--primary)',
          }}
        >
          {jogador.pontos.toLocaleString('pt-BR')} pts
        </div>
      </div>
    </div>
  )
}
