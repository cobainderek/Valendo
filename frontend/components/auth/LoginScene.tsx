'use client'

import { Valdo } from '@/components/ui/Valdo'
import { Doodle } from '@/components/ui/Doodle'

export function LoginScene() {
  return (
    <div
      className="auth-scene"
      style={{
        background: 'var(--primary)',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '3px solid var(--ink)',
      }}
    >
      {/* Grid of dots */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Floating doodles */}
      <div style={{ position: 'absolute', top: 60, left: 80 }}>
        <Doodle kind="star" size={56} rotate={-12} />
      </div>
      <div style={{ position: 'absolute', top: 120, right: 90 }}>
        <Doodle kind="spark" size={44} color="#F5C518" rotate={10} />
      </div>
      <div style={{ position: 'absolute', bottom: 140, left: 50 }}>
        <Doodle kind="squiggle" size={70} color="#F5C518" rotate={-8} />
      </div>
      <div style={{ position: 'absolute', bottom: 90, right: 60 }}>
        <Doodle kind="zigzag" size={80} color="#F5C518" rotate={6} />
      </div>
      <div style={{ position: 'absolute', top: 340, left: 40 }}>
        <Doodle kind="dots" size={60} color="#F5C518" />
      </div>

      {/* VS badge floating */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          right: 140,
          background: 'var(--accent)',
          border: '3px solid var(--ink)',
          width: 84,
          height: 84,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '4px 4px 0 var(--ink)',
          transform: 'rotate(-8deg)',
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 32,
          color: 'var(--accent-ink)',
        }}
      >
        VS
      </div>

      {/* Speech bubble */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 60,
          background: '#fff',
          border: '3px solid var(--ink)',
          padding: '12px 18px',
          borderRadius: 18,
          boxShadow: '4px 4px 0 var(--ink)',
          fontFamily: 'var(--font-hand)',
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--ink)',
          transform: 'rotate(-4deg)',
          maxWidth: 220,
        }}
      >
        bora ver quem sabe mais?
        <div
          style={{
            position: 'absolute',
            bottom: -16,
            left: 40,
            width: 24,
            height: 24,
            background: '#fff',
            borderRight: '3px solid var(--ink)',
            borderBottom: '3px solid var(--ink)',
            transform: 'rotate(45deg)',
          }}
        />
      </div>

      {/* Mascot */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Valdo size={320} expression="idle" accessory="book" tilt={-3} />
      </div>

      {/* Stats badge floating */}
      <div
        style={{
          position: 'absolute',
          top: 380,
          right: 40,
          background: '#fff',
          border: '3px solid var(--ink)',
          padding: '12px 16px',
          borderRadius: 14,
          boxShadow: '3px 3px 0 var(--ink)',
          transform: 'rotate(5deg)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Doodle kind="lightning" size={30} />
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, color: 'var(--ink)', lineHeight: 1 }}>8.421</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            duelos hoje
          </div>
        </div>
      </div>

      {/* Live duel mini-card */}
      <div
        className="doodle-card"
        style={{
          position: 'absolute',
          bottom: 40,
          right: 30,
          padding: 14,
          background: '#fff',
          transform: 'rotate(4deg)',
          width: 220,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="animate-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', color: 'var(--red)', textTransform: 'uppercase' }}>
            ao vivo
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7C3AED', border: '2px solid var(--ink)' }} />
            <span style={{ fontWeight: 800, fontSize: 13 }}>leo_z</span>
          </div>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 20, color: 'var(--orange)' }}>VS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 13 }}>mari.04</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#E8601C', border: '2px solid var(--ink)' }} />
          </div>
        </div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '2px dashed var(--border)', fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>
          História · Segunda Guerra
        </div>
      </div>
    </div>
  )
}
