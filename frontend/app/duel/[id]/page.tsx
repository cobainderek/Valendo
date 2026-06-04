'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * A tela de jogo real é /room/[id]. A animação VS/FIGHT que vivia aqui virou
 * o componente reutilizável VsIntro (components/room/VsIntro.tsx), exibido
 * pela própria sala quando o duelo começa. Esta rota só redireciona pra não
 * quebrar nenhum link antigo.
 */
export default function DuelRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  useEffect(() => {
    router.replace(`/room/${id}`)
  }, [id, router])

  return null
}
