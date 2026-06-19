'use client'

import { useMemo, useState } from 'react'
import { DoodleIcon } from '@/components/ui/DoodleIcon'
import type { Sala } from '@/lib/salas'

interface SalasListProps {
  salas: Sala[]
  onEntrar?: (id: string) => void
  onCriar?: () => void
}

type Aba = 'publicas' | 'privadas'

export function SalasList({ salas, onEntrar, onCriar }: SalasListProps) {
  const [aba, setAba] = useState<Aba>('publicas')
  const [busca, setBusca] = useState('')

  const salasFiltradas = useMemo(() => {
    const porAba = salas.filter((s) => (aba === 'privadas' ? s.privada : !s.privada))
    const q = busca.trim().toLowerCase()
    if (!q) return porAba
    return porAba.filter(
      (s) => s.nome.toLowerCase().includes(q) || s.tema.toLowerCase().includes(q)
    )
  }, [salas, aba, busca])

  const totalJogando = salas.reduce((acc, s) => acc + s.jogadores, 0)

  return (
    <section
      className="doodle-card"
      style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)' }}
    >
      {/* Header */}
      <header
        className="salas-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '2.5px solid var(--ink)',
          background: 'var(--primary)',
          color: '#fff',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 20,
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Salas ativas
          </h2>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 800,
              background: 'rgba(255,255,255,0.14)',
              border: '2px solid var(--ink)',
              borderRadius: 999,
              padding: '3px 10px',
            }}
          >
            <span
              className="animate-pulse-dot"
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#F5C518' }}
            />
            {totalJogando} jogando
          </span>
        </div>

        <button
          className="btn btn-accent salas-criar-btn"
          style={{ padding: '10px 16px', fontSize: 14 }}
          onClick={onCriar}
        >
          <DoodleIcon name="plus" size={16} strokeColor="var(--accent-ink)" />
          Criar sala
        </button>
      </header>

      {/* Tabs + busca */}
      <div
        className="salas-tabs"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 20px',
          borderBottom: '2px dashed var(--border)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <TabBtn ativo={aba === 'publicas'} onClick={() => setAba('publicas')}>
            Públicas
          </TabBtn>
          <TabBtn ativo={aba === 'privadas'} onClick={() => setAba('privadas')}>
            Privadas
          </TabBtn>
        </div>

        <div className="salas-busca" style={{ position: 'relative', flex: 1, maxWidth: 320, marginLeft: 'auto' }}>
          <span
            className="input-icon"
            style={{ left: 14, top: '50%', transform: 'translateY(-50%)' }}
          >
            <DoodleIcon name="search" size={18} />
          </span>
          <input
            className="input"
            style={{ padding: '10px 14px 10px 40px', fontSize: 14, boxShadow: 'none' }}
            placeholder="Buscar sala ou tema..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {salasFiltradas.length === 0 && (
          <li
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--muted)',
              fontWeight: 700,
            }}
          >
            Nenhuma sala {aba === 'privadas' ? 'privada' : 'pública'} por aqui.
            <br />
            <button
              className="btn btn-accent"
              style={{ marginTop: 14, padding: '10px 16px', fontSize: 14 }}
              onClick={onCriar}
            >
              Cria a primeira
            </button>
          </li>
        )}

        {salasFiltradas.map((s, i) => {
          const cheia = s.jogadores >= s.maxJogadores
          return (
            <li
              key={s.id}
              className="salas-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 160px 110px 120px',
                alignItems: 'center',
                gap: 16,
                padding: '14px 20px',
                borderTop: i === 0 ? 'none' : '1.5px dashed var(--border)',
              }}
            >
              <div className="salas-row-info" style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 800,
                    fontSize: 15,
                    color: 'var(--ink)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.nome}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>
                  host: {s.host}
                </div>
              </div>

              <span
                className="salas-row-tema"
                style={{
                  justifySelf: 'start',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '4px 10px',
                  border: '2px solid var(--ink)',
                  borderRadius: 999,
                  background: 'var(--primary-soft)',
                  color: 'var(--primary-dark)',
                }}
              >
                {s.tema}
              </span>

              <span
                className="salas-row-jog"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 900,
                  fontSize: 15,
                  color: cheia ? 'var(--red)' : 'var(--ink)',
                  justifySelf: 'center',
                }}
              >
                {s.jogadores}
                <span style={{ color: 'var(--muted)', fontWeight: 700 }}>/{s.maxJogadores}</span>
              </span>

              <button
                className={`salas-row-btn ${cheia ? 'btn' : 'btn btn-accent'}`}
                style={{
                  padding: '8px 14px',
                  fontSize: 13,
                  justifySelf: 'end',
                  opacity: cheia ? 0.55 : 1,
                  cursor: cheia ? 'not-allowed' : 'pointer',
                }}
                disabled={cheia}
                onClick={() => onEntrar?.(s.id)}
              >
                {cheia ? 'Cheia' : 'Entrar'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function TabBtn({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 800,
        fontSize: 13,
        padding: '8px 14px',
        borderRadius: 10,
        border: '2.5px solid var(--ink)',
        background: ativo ? 'var(--accent)' : 'var(--bg-card)',
        color: ativo ? 'var(--accent-ink)' : 'var(--ink)',
        boxShadow: ativo ? '2px 2px 0 var(--ink)' : 'none',
        cursor: 'pointer',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </button>
  )
}
