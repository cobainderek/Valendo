'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogoMark } from '@/components/ui/LogoMark'
import { CreateRoomForm, type NovaSala } from '@/components/room/CreateRoomForm'
import { TEMAS } from '@/lib/temas'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { criarSala } from '@/services/rooms'
import { gerarPerguntas } from '@/services/questions'

function CreateRoomPageInner() {
  const { carregando: authCarregando } = useAuthGuard()
  const router = useRouter()
  const searchParams = useSearchParams()
  const temaInicial = searchParams.get('tema') || undefined
  const [carregando, setCarregando] = useState(false)
  const [textoCarregando, setTextoCarregando] = useState('')
  const [erro, setErro] = useState('')

  if (authCarregando) return null

  async function handleCreate(sala: NovaSala) {
    if (!sala.nome) {
      setErro('Dá um nome pra tua sala.')
      return
    }
    setCarregando(true)
    setTextoCarregando('Criando...')
    setErro('')
    try {
      const tema = TEMAS.find((t) => t.id === sala.temaId)
      const salaCriada = await criarSala({
        theme: tema?.nome || sala.temaId || undefined,
        isPrivate: sala.soloMode ? true : sala.privada,
        isSoloMode: sala.soloMode,
        maxPlayers: sala.soloMode ? 2 : sala.maxJogadores,
        questionTime: sala.tempoPergunta,
      })

      // Com PDF anexado, gera as perguntas do material AGORA (a IA demora
      // alguns segundos). O start da sala detecta que já existem perguntas
      // e não regenera pelo tema.
      if (sala.arquivoPdf) {
        setTextoCarregando('Gerando perguntas do seu PDF... 🤖')
        try {
          await gerarPerguntas(salaCriada.code, sala.arquivoPdf)
        } catch (err) {
          // A sala já existe — segue pra ela, mas avisa que caiu no tema.
          console.error('Falha na geração via PDF:', err)
          setErro('Sala criada, mas a geração pelo PDF falhou — o duelo usará o tema escolhido.')
        }
      }

      router.push(`/room/${salaCriada.code}`)
    } catch {
      setErro('Não rolou criar a sala. Tenta de novo.')
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
            textoCarregando={textoCarregando}
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
