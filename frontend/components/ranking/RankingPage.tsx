'use client'

import { Doodle } from '@/components/ui/Doodle'
import type { RankingEntry } from '@/services/ranking'

interface RankingPageProps {
  ranking: RankingEntry[]
  carregando: boolean
  meuTag?: string
}

const MEDAL_COLORS: Record<number, string> = {
  1: '#F5C518',
  2: '#C0C0C0',
  3: '#CD7F32',
}

export function RankingPage({ ranking, carregando, meuTag }: RankingPageProps) {
  if (carregando) {
    return (
      <div className="doodle-card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontWeight: 700, color: 'var(--muted)' }}>Carregando ranking...</p>
      </div>
    )
  }

  if (ranking.length === 0) {
    return (
      <div className="doodle-card" style={{ padding: 40, textAlign: 'center' }}>
        <Doodle kind="spark" size={32} />
        <p style={{ fontWeight: 700, color: 'var(--muted)', marginTop: 12 }}>
          Nenhum jogador pontuou esta semana ainda. Seja o primeiro!
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top 3 destaque */}
      {ranking.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {ranking.slice(0, 3).map((r) => (
            <div
              key={r.pos}
              className="doodle-card"
              style={{
                padding: 20,
                textAlign: 'center',
                background: r.pos === 1 ? 'var(--bg-cream)' : 'var(--bg-card)',
                border: r.tag === meuTag ? '2.5px solid var(--primary)' : undefined,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: MEDAL_COLORS[r.pos],
                  border: '2.5px solid var(--ink)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 10px',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 900,
                  fontSize: 24,
                  color: '#fff',
                }}
              >
                {r.pos}
              </div>
              <p style={{ fontWeight: 900, fontSize: 15, margin: '0 0 4px' }}>
                {r.tag}
                {r.tag === meuTag && <span style={{ fontSize: 11, color: 'var(--muted)' }}> (você)</span>}
              </p>
              <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', margin: 0 }}>
                {r.xp.toLocaleString('pt-BR')} XP
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Lista completa */}
      <div className="doodle-card" style={{ padding: 18 }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ranking.map((r) => {
            const isMe = r.tag === meuTag
            return (
              <li
                key={r.pos}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: isMe ? 'var(--primary)' : r.pos <= 3 ? 'var(--primary-soft)' : '#fff',
                  color: isMe ? '#fff' : 'var(--ink)',
                  border: '2px solid var(--ink)',
                  borderRadius: 10,
                  boxShadow: isMe || r.pos <= 3 ? '2px 2px 0 var(--ink)' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 900,
                    fontSize: 16,
                    width: 28,
                    color: isMe ? '#F5C518' : MEDAL_COLORS[r.pos] || 'var(--muted)',
                  }}
                >
                  {r.pos}
                </span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--orange)',
                    border: '2px solid var(--ink)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 900,
                    fontSize: 14,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {r.tag[0].toUpperCase()}
                </div>
                <span style={{ flex: 1, fontWeight: 800, fontSize: 14 }}>
                  {r.tag}
                  {isMe && <span style={{ fontSize: 11, opacity: 0.8 }}> (você)</span>}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 900,
                    fontSize: 14,
                    color: isMe ? '#F5C518' : 'var(--primary)',
                  }}
                >
                  {r.xp.toLocaleString('pt-BR')} XP
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
