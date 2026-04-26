'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/lobby/Sidebar'
import { SalasList } from '@/components/lobby/SalasList'
import { TemaGrid, RankingCard } from '@/components/lobby/LobbyComponents'
import { TEMAS } from '@/lib/temas'
import type { Sala } from '@/lib/salas'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { listarSalas, type SalaAPI } from '@/services/rooms'
import { buscarRankingSemanal } from '@/services/ranking'

function mapearSala(sala: SalaAPI): Sala {
  return {
    id: sala.code,
    nome: sala.code,
    tema: sala.theme || 'Livre',
    temaId: sala.theme?.toLowerCase() || 'livre',
    jogadores: sala.playerCount ?? 0,
    maxJogadores: sala.maxPlayers ?? 4,
    privada: sala.isPrivate,
    host: sala.host.tag,
  }
}

export default function LobbyPage() {
  const { carregando } = useAuthGuard()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const [salas, setSalas] = useState<Sala[]>([])
  const [rankingData, setRankingData] = useState<{ p: number; n: string; s: number; me: boolean }[]>([])
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    listarSalas()
      .then((data) => setSalas(data.map(mapearSala)))
      .catch(() => setSalas([]))

    buscarRankingSemanal(5)
      .then((data) => setRankingData(data.map((r) => ({
        p: r.pos,
        n: r.tag,
        s: r.xp,
        me: r.tag === user?.tag,
      }))))
      .catch(() => setRankingData([]))
  }, [user?.tag])

  if (carregando) return null

  function handleLogout() {
    logout()
    router.push('/auth/login')
  }

  function handleCriarSala() {
    router.push('/room/create')
  }

  function handleEntrarSala(id: string) {
    router.push(`/room/${id}`)
  }

  function handleSelecionarTema(id: string) {
    router.push(`/room/create?tema=${id}`)
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
      <Sidebar onLogout={handleLogout} usuario={useAuthStore.getState().user} activeRoute="/lobby" />

      <main style={{ padding: '32px 40px 60px', maxWidth: 1280 }}>
        {/* Saudação enxuta */}
        <header style={{ marginBottom: 24 }}>
          <p
            style={{
              fontFamily: 'var(--font-hand)',
              fontSize: 20,
              color: 'var(--muted)',
              margin: 0,
              fontWeight: 700,
            }}
          >
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 32,
              margin: '2px 0 0',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Jogar agora
          </h1>
        </header>

        {/* Grid: principal (salas + temas) | ranking */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, minWidth: 0 }}>
            <SalasList
              salas={salas}
              onCriar={handleCriarSala}
              onEntrar={handleEntrarSala}
            />

            <section>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 900,
                    fontSize: 18,
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Explorar por tema
                </h3>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--muted)',
                    fontWeight: 700,
                  }}
                >
                  cria uma sala direto do tema
                </span>
              </div>
              <TemaGrid temas={TEMAS} onSelect={handleSelecionarTema} />
            </section>
          </div>

          <RankingCard ranking={rankingData} />
        </div>
      </main>
    </div>
  )
}
