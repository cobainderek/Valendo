'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/lobby/Sidebar'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useAuthStore } from '@/lib/store/useAuthStore'

export default function ProfileRoute() {
  const { carregando } = useAuthGuard()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  if (carregando) return null

  function handleLogout() {
    logout()
    router.push('/auth/login')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page)',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
      }}
    >
      <Sidebar onLogout={handleLogout} usuario={user} activeRoute="/profile" />

      <main style={{ padding: '32px 40px 60px', maxWidth: 1280 }}>
        <header style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 32,
              margin: 0,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Meu perfil
          </h1>
        </header>

        <ProfileCard user={user} onLogout={handleLogout} />
      </main>
    </div>
  )
}
