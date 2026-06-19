'use client'

import { useEffect, useState } from 'react'
import { DoodleIcon } from '@/components/ui/DoodleIcon'

interface Dica {
  icon: string
  cor: string
  titulo: string
  texto: string
}

const DICAS: Dica[] = [
  {
    icon: 'bolt',
    cor: '#F5C518',
    titulo: 'Responde rápido',
    texto: 'Quem responde primeiro ganha mais pontos — mas errar custa streak.',
  },
  {
    icon: 'flame',
    cor: '#E8601C',
    titulo: 'Streak vale ouro',
    texto: '5 acertos seguidos → +5 pts por questão. Não quebra o embalo.',
  },
  {
    icon: 'trophy',
    cor: '#F5C518',
    titulo: 'Vitória no PvP',
    texto: 'Derrotar o oponente rende +50 pts extras pro ranking da semana.',
  },
  {
    icon: 'folder',
    cor: '#1B4FBE',
    titulo: 'Apostila própria',
    texto: 'Sobe teu PDF e a IA gera perguntas do teu material. Tema da semana dobra pontos.',
  },
  {
    icon: 'sword',
    cor: '#7C3AED',
    titulo: 'Primeiro do dia',
    texto: 'O primeiro duelo do dia vale +15 pts bônus. Não deixa pra depois.',
  },
  {
    icon: 'microscope',
    cor: '#059669',
    titulo: 'Acerto perfeito',
    texto: 'Gabaritar todas as perguntas da rodada → +40 pts de bônus.',
  },
]

export function DicasCarousel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % DICAS.length), 7500)
    return () => clearInterval(t)
  }, [])

  const d = DICAS[idx]

  return (
    <div
      className="doodle-card dicas-root"
      style={{
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'var(--bg-cream)',
        minHeight: 84,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          border: '2.5px solid var(--ink)',
          background: '#fff',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <DoodleIcon name={d.icon} size={30} color={d.cor} />
      </div>
      <div key={idx} className="fade-slide-up" style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: 14,
            color: 'var(--muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          dica {idx + 1}/{DICAS.length}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: 16,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
            marginTop: 2,
          }}
        >
          {d.titulo}
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: 'var(--ink-soft)',
            marginTop: 2,
            lineHeight: 1.4,
          }}
        >
          {d.texto}
        </div>
      </div>
      <div className="dicas-dots" style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {DICAS.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === idx ? 18 : 6,
              height: 6,
              borderRadius: 999,
              background: i === idx ? 'var(--primary)' : 'var(--border)',
              transition: 'width .25s ease, background .25s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
