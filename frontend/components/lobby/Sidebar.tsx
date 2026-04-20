'use client'

import { LogoMark } from '@/components/ui/LogoMark'
import { DoodleIcon } from '@/components/ui/DoodleIcon'

interface SidebarProps {
  onLogout: () => void
}

const NAV_ITEMS = [
  { label: 'Jogar agora', icon: 'swords', href: '/lobby', active: true },
  { label: 'Meus amigos', icon: 'people', href: '#' },
  { label: 'Ranking', icon: 'trophy', href: '/ranking' },
  { label: 'Minhas apostilas', icon: 'folder', href: '#' },
]

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside
      style={{
        background: 'var(--primary)',
        color: '#fff',
        padding: '22px 18px',
        borderRight: '3px solid var(--ink)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LogoMark />
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: 24,
            color: '#fff',
            letterSpacing: '-0.02em',
          }}
        >
          Valendo
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 12px',
              borderRadius: 10,
              textDecoration: 'none',
              color: item.active ? 'var(--accent-ink)' : '#fff',
              background: item.active ? 'var(--accent)' : 'transparent',
              border: item.active ? '2.5px solid var(--ink)' : '2.5px solid transparent',
              boxShadow: item.active ? '2px 2px 0 var(--ink)' : 'none',
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            <DoodleIcon
              name={item.icon}
              size={20}
              strokeColor={item.active ? 'var(--accent-ink)' : '#fff'}
              color="transparent"
            />
            {item.label}
          </a>
        ))}
      </nav>

      {/* Perfil minimalista no rodapé */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <a
          href="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 10px',
            borderRadius: 10,
            textDecoration: 'none',
            color: '#fff',
            background: 'rgba(255,255,255,0.08)',
            border: '2px solid rgba(255,255,255,0.18)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#E8601C',
              border: '2.5px solid var(--ink)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 16,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            D
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 13,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              derek_o_insup
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 700 }}>ver perfil</div>
          </div>
        </a>

        <button
          className="btn"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            borderColor: '#1A1A2E',
            boxShadow: '2px 2px 0 var(--ink)',
            fontSize: 14,
            padding: '10px 14px',
          }}
          onClick={onLogout}
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
