'use client'

import { useState } from 'react'
import { DoodleIcon } from '@/components/ui/DoodleIcon'
import type { PlayerInfo } from '@/services/rooms'

interface WaitingRoomProps {
  code: string
  theme: string | null
  players: PlayerInfo[]
  maxPlayers: number
  isHost: boolean
  onStart: () => void
  iniciando: boolean
  /** Jogador (não-host) sai da sala. */
  onSair?: () => void
  /** Host cancela a sala pra todo mundo. */
  onCancelar?: () => void
  saindo?: boolean
}

export function WaitingRoom({
  code,
  theme,
  players,
  maxPlayers,
  isHost,
  onStart,
  iniciando,
  onSair,
  onCancelar,
  saindo,
}: WaitingRoomProps) {
  const [copiado, setCopiado] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  function copiarCodigo() {
    navigator.clipboard.writeText(code)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Código */}
      <div className="doodle-card" style={{ padding: '24px 20px', textAlign: 'center', background: 'var(--bg-cream)' }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--muted)', margin: '0 0 6px' }}>Código da sala</p>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 44, letterSpacing: '0.15em', color: 'var(--primary)' }}>
          {code}
        </div>
        <button className="btn" style={{ fontSize: 13, padding: '8px 16px', marginTop: 8 }} onClick={copiarCodigo}>
          {copiado ? 'Copiado!' : 'Copiar código'}
        </button>
      </div>

      {/* Info */}
      <div className="doodle-card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <DoodleIcon name="book" size={18} />
          <span style={{ fontWeight: 800, fontSize: 14 }}>Tema: {theme || 'Livre'}</span>
        </div>
      </div>

      {/* Players */}
      <div className="doodle-card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 16, margin: 0 }}>
            Jogadores
          </h3>
          <span className="chip" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
            {players.length}/{maxPlayers}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 8, background: 'var(--border)', borderRadius: 999, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(players.length / maxPlayers) * 100}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                background: i === 0 ? 'var(--primary-soft)' : '#fff',
                border: '2px solid var(--ink)',
                borderRadius: 10,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--orange)', border: '2px solid var(--ink)',
                display: 'grid', placeItems: 'center',
                fontWeight: 900, fontSize: 14, color: '#fff', flexShrink: 0,
              }}>
                {p.name[0].toUpperCase()}
              </div>
              <span style={{ fontWeight: 800, fontSize: 14, flex: 1 }}>{p.tag}</span>
              {p.isBot && <span className="chip" style={{ fontSize: 11, borderColor: 'var(--purple)', color: 'var(--purple)' }}>Bot</span>}
              {i === 0 && !p.isBot && <span className="chip" style={{ fontSize: 11, borderColor: 'var(--accent)', color: 'var(--accent-ink)', background: 'var(--accent)' }}>host</span>}
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                background: 'var(--bg-page)',
                border: '2px dashed var(--border)',
                borderRadius: 10,
                color: 'var(--muted)',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--border)',
                display: 'grid', placeItems: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                ?
              </div>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Aguardando jogador...</span>
            </div>
          ))}
        </div>
      </div>

      {/* Start button (host only) */}
      {isHost && (
        <button
          className="btn btn-accent"
          style={{ width: '100%', fontSize: 16, padding: '16px 22px' }}
          onClick={onStart}
          disabled={iniciando || players.length < 2}
        >
          {iniciando ? 'Gerando perguntas...' : 'Iniciar Partida'}
          <DoodleIcon name="play" size={18} strokeColor="var(--accent-ink)" color="var(--accent-ink)" />
        </button>
      )}

      {!isHost && (
        <div className="doodle-card" style={{ padding: '14px 18px', textAlign: 'center', background: 'var(--bg-cream)' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--muted)', margin: 0 }}>
            Aguardando o host iniciar a partida...
          </p>
        </div>
      )}

      {/* Sair (jogador) / Cancelar (host) — com confirmação em 2 cliques */}
      {(isHost ? onCancelar : onSair) && (
        <button
          className="btn"
          style={{
            width: '100%',
            padding: '12px 18px',
            color: 'var(--red)',
            borderColor: confirmando ? 'var(--red)' : undefined,
            background: confirmando ? '#FEE2E2' : undefined,
          }}
          disabled={saindo || iniciando}
          onClick={() => {
            if (!confirmando) {
              setConfirmando(true)
              setTimeout(() => setConfirmando(false), 3000)
              return
            }
            if (isHost) onCancelar?.()
            else onSair?.()
          }}
        >
          {saindo
            ? 'Saindo...'
            : confirmando
              ? isHost
                ? 'Clica de novo pra confirmar — cancela pra TODOS'
                : 'Clica de novo pra confirmar'
              : isHost
                ? 'Cancelar sala'
                : 'Sair da sala'}
        </button>
      )}
    </div>
  )
}
