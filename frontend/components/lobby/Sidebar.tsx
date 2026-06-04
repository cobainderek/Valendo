'use client'

import { LogoMark } from '@/components/ui/LogoMark'
import { DoodleIcon } from '@/components/ui/DoodleIcon'
import { useChatStore } from '@/lib/store/useChatStore'

interface SidebarProps {
  onLogout: () => void
  usuario?: { name: string; tag: string } | null
  activeRoute?: string
}

// "Meus amigos" não navega — abre o painel flutuante de chat (acao: 'amigos').
interface NavItem {
  label: string
  icon: string
  href: string
  acao?: 'amigos'
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Jogar agora', icon: 'swords', href: '/lobby' },
  { label: 'Meus amigos', icon: 'people', href: '#', acao: 'amigos' },
  { label: 'Ranking', icon: 'trophy', href: '/ranking' },
]

export function Sidebar({ onLogout, usuario, activeRoute }: SidebarProps) {
  const inicial = usuario?.name?.[0]?.toUpperCase() || '?'
  const tag = usuario?.tag || 'jogador'
  const abrirPainelAmigos = useChatStore((s) => s.setPainelAberto)

  return (
    <aside
      className="sidebar-doodle"
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
      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const active = activeRoute === item.href
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={
                item.acao === 'amigos'
                  ? (e) => {
                      e.preventDefault()
                      abrirPainelAmigos(true)
                    }
                  : undefined
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                color: active ? 'var(--accent-ink)' : '#fff',
                background: active ? 'var(--accent)' : 'transparent',
                border: active ? '2.5px solid var(--ink)' : '2.5px solid transparent',
                boxShadow: active ? '2px 2px 0 var(--ink)' : 'none',
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              <DoodleIcon
                name={item.icon}
                size={20}
                strokeColor={active ? 'var(--accent-ink)' : '#fff'}
                color="transparent"
              />
              <span className="sidebar-rotulo">{item.label}</span>
            </a>
          )
        })}
      </nav>

      {/* Perfil minimalista no rodapé */}
      <div className="sidebar-rodape" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            background: activeRoute === '/profile' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
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
            {inicial}
          </div>
          <div className="sidebar-rotulo" style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 13,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {tag}
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 700 }}>ver perfil</div>
          </div>
        </a>

        <button
          className="btn sidebar-sair"
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
