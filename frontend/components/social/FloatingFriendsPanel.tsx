'use client'

import { useEffect } from 'react'
import { DoodleIcon } from '@/components/ui/DoodleIcon'
import { FriendsChatPanel } from './FriendsChatPanel'
import { useChatStore } from '@/lib/store/useChatStore'
import { useAuthStore } from '@/lib/store/useAuthStore'

const STORAGE_KEY = 'valendo:chatPanel:aberto'

export function FloatingFriendsPanel() {
  const token = useAuthStore((s) => s.token)
  const iniciar = useChatStore((s) => s.iniciar)
  const conversas = useChatStore((s) => s.conversas)
  const pedidos = useChatStore((s) => s.pedidos)
  // Estado do painel mora no store — o Sidebar ("Meus amigos") também abre.
  const aberto = useChatStore((s) => s.painelAberto)
  const setAberto = useChatStore((s) => s.setPainelAberto)

  // Total real de notificações: mensagens não lidas + pedidos pendentes.
  const naoLidas = conversas.reduce((soma, c) => soma + c.unread, 0) + pedidos.length

  // Restaura o estado salvo só depois da hidratação — inicializar direto do
  // localStorage causaria mismatch entre servidor e cliente.
  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY)
    if (salvo === '1') setAberto(true)
  }, [setAberto])

  // Conecta o socket do chat assim que houver sessão — mesmo com o painel
  // fechado, pra badge de não lidas atualizar em tempo real.
  useEffect(() => {
    if (token) iniciar()
  }, [token, iniciar])

  if (!token) return null

  if (aberto) {
    return <FriendsChatPanel onFechar={() => setAberto(false)} />
  }

  return (
    <button
      type="button"
      onClick={() => setAberto(true)}
      title="Abrir amigos"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        background: 'var(--primary)',
        color: '#fff',
        border: '2.5px solid var(--ink)',
        borderRadius: 999,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        boxShadow: '4px 4px 0 var(--ink)',
        zIndex: 50,
        fontFamily: 'var(--font-ui)',
        fontWeight: 900,
        fontSize: 14,
        letterSpacing: '-0.01em',
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
      <DoodleIcon name="people" size={20} strokeColor="#fff" />
      amigos
      {naoLidas > 0 && (
        <span
          style={{
            background: 'var(--green)',
            color: '#fff',
            border: '2px solid var(--ink)',
            borderRadius: 999,
            fontWeight: 900,
            fontSize: 11,
            padding: '1px 8px',
            marginLeft: 2,
          }}
        >
          {naoLidas > 99 ? '99+' : naoLidas}
        </span>
      )}
    </button>
  )
}
