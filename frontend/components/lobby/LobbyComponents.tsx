'use client'

import { DoodleIcon } from '@/components/ui/DoodleIcon'
import { Doodle } from '@/components/ui/Doodle'
import type { Tema } from '@/lib/temas'

interface TemaGridProps {
  temas: Tema[]
  onSelect?: (id: string) => void
}

export function TemaGrid({ temas, onSelect }: TemaGridProps) {
  return (
    <div className="tema-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {temas.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect?.(t.id)}
          className="doodle-card"
          style={{
            padding: 14,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--bg-card)',
            font: 'inherit',
            transition: 'transform .1s ease, box-shadow .1s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-1px, -1px)'
            e.currentTarget.style.boxShadow = '5px 5px 0 var(--ink)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '4px 4px 0 var(--ink)'
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: t.bg,
              border: '2.5px solid var(--ink)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <DoodleIcon name={t.icon} size={26} color={t.color} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 900,
                fontSize: 15,
                letterSpacing: '-0.01em',
              }}
            >
              {t.nome}
            </div>
            <div
              style={{
                color: 'var(--muted)',
                fontSize: 12,
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {t.duelos === 'novo' ? 'novo' : `${t.duelos} duelos`}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

interface RankingCardProps {
  ranking?: { p: number; n: string; s: number; me: boolean }[]
}

export function RankingCard({ ranking = [] }: RankingCardProps) {
  return (
    <aside className="doodle-card rankcard-root" style={{ padding: 18, background: 'var(--bg-cream)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Doodle kind="trophy" size={22} />
        <h3
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: 16,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Ranking da semana
        </h3>
      </div>
      {ranking.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
          Nenhum jogador pontuou esta semana ainda.
        </p>
      ) : null}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {ranking.map((r) => (
          <li
            key={r.p}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              background: r.me ? 'var(--primary)' : '#fff',
              color: r.me ? '#fff' : 'var(--ink)',
              border: '2px solid var(--ink)',
              borderRadius: 10,
              boxShadow: r.me ? '2px 2px 0 var(--ink)' : 'none',
            }}
          >
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 14, width: 18 }}>
              {r.p}
            </span>
            <span
              style={{
                flex: 1,
                fontWeight: 800,
                fontSize: 13,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {r.n}
              {r.me && <span style={{ fontSize: 11, opacity: 0.8 }}> (você)</span>}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 900,
                fontSize: 13,
                color: r.me ? '#F5C518' : 'var(--primary)',
              }}
            >
              {r.s.toLocaleString('pt-BR')}
            </span>
          </li>
        ))}
      </ul>
      <a
        className="link-hand"
        href="/ranking"
        style={{ display: 'inline-block', marginTop: 12, fontSize: 18 }}
      >
        ver ranking completo
      </a>
    </aside>
  )
}
