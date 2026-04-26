'use client'

import { DoodleIcon } from '@/components/ui/DoodleIcon'
import { Doodle } from '@/components/ui/Doodle'
import type { PlayerInfo } from '@/services/rooms'

interface GameResultsProps {
  players: PlayerInfo[]
  winnerId: string | null
  meuId: string | null
  totalQuestions: number
  onVoltar: () => void
}

export function GameResults({ players, winnerId, meuId, totalQuestions, onVoltar }: GameResultsProps) {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.correct - a.correct
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Winner banner */}
      <div className="doodle-card" style={{ padding: 24, textAlign: 'center', background: 'var(--bg-cream)' }}>
        <Doodle kind="trophy" size={48} />
        <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 28, margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
          {winnerId === meuId ? 'Você venceu!' : `${sorted[0]?.tag} venceu!`}
        </h2>
        <p style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 14, margin: 0 }}>
          {sorted[0]?.correct}/{totalQuestions} acertos · {sorted[0]?.score} XP
        </p>
      </div>

      {/* Ranking da partida */}
      <div className="doodle-card" style={{ padding: 18 }}>
        <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 16, margin: '0 0 14px' }}>
          Resultado da partida
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((p, i) => {
            const isMe = p.id === meuId
            const isWinner = p.id === winnerId
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: isWinner ? 'var(--accent)' : isMe ? 'var(--primary)' : '#fff',
                  color: isWinner ? 'var(--accent-ink)' : isMe ? '#fff' : 'var(--ink)',
                  border: '2.5px solid var(--ink)',
                  borderRadius: 12,
                  boxShadow: isWinner || isMe ? '2px 2px 0 var(--ink)' : 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 18, width: 28 }}>
                  {i === 0 ? '🏆' : `${i + 1}º`}
                </span>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: isWinner ? 'var(--ink)' : 'var(--orange)',
                  border: '2px solid var(--ink)',
                  display: 'grid', placeItems: 'center',
                  fontWeight: 900, fontSize: 15, color: '#fff', flexShrink: 0,
                }}>
                  {p.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>
                    {p.tag} {isMe && <span style={{ fontSize: 11, opacity: 0.8 }}>(você)</span>}
                    {p.isBot && <span className="chip" style={{ fontSize: 10, marginLeft: 6, borderColor: 'var(--purple)', color: isWinner ? '#fff' : 'var(--purple)' }}>Bot</span>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>
                    {p.correct}/{totalQuestions} acertos
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 15 }}>
                  {p.score} XP
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', fontSize: 16, padding: '14px 20px' }}
        onClick={onVoltar}
      >
        Voltar ao lobby
      </button>
    </div>
  )
}
