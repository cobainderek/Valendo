'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/useAuthStore'

export function useAuthGuard() {
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  // O token vive no localStorage — só dá pra checar depois da hidratação,
  // por isso o setState dentro do effect (inicializar direto causaria
  // mismatch servidor/cliente).
  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/auth/login')
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCarregando(false)
    }
  }, [isLoggedIn, router])

  return { carregando }
}
