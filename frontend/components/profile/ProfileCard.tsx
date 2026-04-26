'use client'

import { DoodleIcon } from '@/components/ui/DoodleIcon'
import { Doodle } from '@/components/ui/Doodle'
import type { User } from '@/services/auth'

interface ProfileCardProps {
  user: User | null
  onLogout: () => void
}

export function ProfileCard({ user, onLogout }: ProfileCardProps) {
  if (!user) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
      <div className="doodle-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'var(--orange)',
              border: '3px solid var(--ink)',
              boxShadow: '3px 3px 0 var(--ink)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 32,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 24,
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              {user.name}
            </h2>
            <p style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 14, margin: '2px 0 0' }}>
              @{user.tag}
            </p>
          </div>
        </div>
      </div>

      <div className="doodle-card" style={{ padding: 20 }}>
        <h3 style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 16,
          margin: '0 0 14px',
        }}>
          Informações
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DoodleIcon name="mail" size={18} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>{user.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DoodleIcon name="star" size={18} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              {user.globalXp.toLocaleString('pt-BR')} XP
            </span>
          </div>
        </div>
      </div>

      <div
        className="doodle-card"
        style={{
          padding: '16px 20px',
          background: 'var(--bg-cream)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Doodle kind="spark" size={24} />
        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--muted)', margin: 0 }}>
          Estatísticas detalhadas (duelos, vitórias, streak) em breve!
        </p>
      </div>

      <button
        className="btn"
        style={{ width: '100%', padding: '12px 18px', color: 'var(--red)' }}
        onClick={onLogout}
      >
        Sair da conta
      </button>
    </div>
  )
}
