'use client'

import { useEffect, useState } from 'react'
import { DoodleIcon } from '@/components/ui/DoodleIcon'
import { FriendsChatPanel } from './FriendsChatPanel'

const STORAGE_KEY = 'valendo:chatPanel:aberto'

export function FloatingFriendsPanel() {
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY)
    if (salvo === '1') setAberto(true)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, aberto ? '1' : '0')
  }, [aberto])

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
        4
      </span>
    </button>
  )
}
