'use client'

import { usePathname } from 'next/navigation'
import { FloatingFriendsPanel } from './FloatingFriendsPanel'

const ROTAS_SEM_PAINEL = ['/auth', '/']

export function GlobalFloatingUI() {
  const pathname = usePathname() || ''

  const esconder = ROTAS_SEM_PAINEL.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  )

  if (esconder) return null

  return <FloatingFriendsPanel />
}
