'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/lobby/Sidebar'
import { RankingPage } from '@/components/ranking/RankingPage'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { buscarRankingSemanal, type RankingEntry } from '@/services/ranking'

export default function RankingRoute() {
  const { carregando: authCarregando } = useAuthGuard()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarRankingSemanal(20)
      .then(setRanking)
      .catch(() => setRanking([]))
      .finally(() => setCarregando(false))
  }, [])

  if (authCarregando) return null

  function handleLogout() {
    logout()
    router.push('/auth/login')
  }

  return (
    <div
      className="layout-com-sidebar"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page)',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
      }}
    >
      <Sidebar onLogout={handleLogout} usuario={user} activeRoute="/ranking" />

      <main className="main-mobile" style={{ padding: '32px 40px 60px', maxWidth: 1280 }}>
        <header style={{ marginBottom: 24 }}>
          <h1
            className="ranking-title"
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 32,
              margin: 0,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Ranking da semana
          </h1>
          <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14, margin: '6px 0 0' }}>
            Os melhores jogadores desta semana.
          </p>
        </header>

        <RankingPage ranking={ranking} carregando={carregando} meuTag={user?.tag} />
      </main>
    </div>
  )
}
