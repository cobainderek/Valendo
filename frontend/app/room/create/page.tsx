'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogoMark } from '@/components/ui/LogoMark'
import { CreateRoomForm, type NovaSala } from '@/components/room/CreateRoomForm'
import { TEMAS } from '@/lib/temas'

function CreateRoomPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const temaInicial = searchParams.get('tema') || undefined
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleCreate(sala: NovaSala) {
    if (!sala.nome) {
      setErro('Dá um nome pra tua sala.')
      return
    }
    setCarregando(true)
    setErro('')
    try {
      // TODO: services/rooms.ts → criarSala(sala)
      await new Promise((r) => setTimeout(r, 400))
      const salaId = Math.random().toString(36).slice(2, 10)
      router.push(`/room/${salaId}`)
    } catch {
      setErro('Não rolou criar a sala. Tenta de novo.')
    } finally {
      setCarregando(false)
    }
  }

  function handleCancel() {
    router.push('/lobby')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          borderBottom: '2.5px solid var(--ink)',
          background: 'var(--bg-card)',
        }}
      >
        <a
          href="/lobby"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: 'var(--primary-dark)',
          }}
        >
          <LogoMark />
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: '-0.02em',
            }}
          >
            Valendo
          </span>
        </a>
        <a className="link-hand" href="/lobby">
          ← voltar pro lobby
        </a>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ marginBottom: 22 }}>
          <h1
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 32,
              margin: 0,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            Nova sala
          </h1>
          <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14, margin: '6px 0 0' }}>
            Configura e compartilha o código com a galera.
          </p>
        </div>

        <div className="doodle-card" style={{ padding: 24 }}>
          <CreateRoomForm
            temas={TEMAS}
            temaInicial={temaInicial}
            carregando={carregando}
            erro={erro}
            onSubmit={handleCreate}
            onCancelar={handleCancel}
          />
        </div>
      </main>
    </div>
  )
}

export default function CreateRoomPage() {
  return (
    <Suspense fallback={null}>
      <CreateRoomPageInner />
    </Suspense>
  )
}
