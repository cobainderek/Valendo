'use client'

import type { PlayerInfo } from '@/services/rooms'

interface PlacarAoVivoProps {
  players: PlayerInfo[]
  meuId: string | null
}

/**
 * Mini-placar exibido durante a partida. Atualiza em tempo real porque o
 * gateway re-emite room:state a cada resposta de qualquer jogador.
 */
export function PlacarAoVivo({ players, meuId }: PlacarAoVivoProps) {
  const ordenados = [...players].sort((a, b) => b.score - a.score)

  return (
    <div
      className="placar-wrap"
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 16,
      }}
    >
      {ordenados.map((p, i) => {
        const souEu = p.id === meuId
        return (
          <div
            key={p.id}
            className="placar-chip"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              border: '2.5px solid var(--ink)',
              borderRadius: 999,
              background: souEu ? 'var(--primary-soft)' : 'var(--bg-card)',
              boxShadow: i === 0 ? '2px 2px 0 var(--ink)' : 'none',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {i === 0 && <span title="Liderando">👑</span>}
            <span
              style={{
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {souEu ? 'Você' : p.name}
            </span>
            <span style={{ color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
              {p.score}
            </span>
            {p.finished && <span title="Terminou">✅</span>}
          </div>
        )
      })}
    </div>
  )
}
