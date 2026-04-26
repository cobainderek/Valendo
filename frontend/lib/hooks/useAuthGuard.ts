'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/useAuthStore'

export function useAuthGuard() {
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/auth/login')
    } else {
      setCarregando(false)
    }
  }, [isLoggedIn, router])

  return { carregando }
}
