'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/lobby/Sidebar'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useAuthStore } from '@/lib/store/useAuthStore'
import {
  obterMeuPerfil,
  atualizarMeuPerfil,
  obterMeuHistorico,
  type PerfilCompleto,
  type DueloHistorico,
  type AtualizarPerfilDTO,
} from '@/services/users'

export default function ProfileRoute() {
  const { carregando: authCarregando } = useAuthGuard()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)

  const [perfil, setPerfil] = useState<PerfilCompleto | null>(null)
  const [carregandoPerfil, setCarregandoPerfil] = useState(true)
  const [historico, setHistorico] = useState<DueloHistorico[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Carga inicial: perfil com stats + primeira página do histórico.
  useEffect(() => {
    if (authCarregando || !user) return
    let ativo = true
    setCarregandoHistorico(true)
    Promise.all([obterMeuPerfil(), obterMeuHistorico()])
      .then(([p, h]) => {
        if (!ativo) return
        setPerfil(p)
        setHistorico(h.items)
        setCursor(h.nextCursor)
      })
      .catch((err) => {
        if (ativo) setErro(err instanceof Error ? err.message : 'Erro ao carregar perfil.')
      })
      .finally(() => {
        if (ativo) {
          setCarregandoPerfil(false)
          setCarregandoHistorico(false)
        }
      })
    return () => {
      ativo = false
    }
  }, [authCarregando, user])

  const carregarMais = useCallback(async () => {
    if (!cursor || carregandoHistorico) return
    setCarregandoHistorico(true)
    try {
      const pagina = await obterMeuHistorico(cursor)
      setHistorico((atual) => [...atual, ...pagina.items])
      setCursor(pagina.nextCursor)
    } catch {
      // silencioso — botão continua disponível pra tentar de novo
    } finally {
      setCarregandoHistorico(false)
    }
  }, [cursor, carregandoHistorico])

  async function salvar(dto: AtualizarPerfilDTO): Promise<boolean> {
    setSalvando(true)
    setErro('')
    setSucesso('')
    try {
      const atualizado = await atualizarMeuPerfil(dto)
      setPerfil(atualizado)
      // Sincroniza o store/localStorage pra UI global (sidebar, chat) refletir.
      if (token && user) {
        login(token, {
          ...user,
          name: atualizado.name,
          tag: atualizado.tag,
          globalXp: atualizado.globalXp,
        })
      }
      setSucesso('Perfil atualizado! ✨')
      return true
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar perfil.')
      return false
    } finally {
      setSalvando(false)
    }
  }

  if (authCarregando) return null

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
      className="layout-com-sidebar"
    >
      <Sidebar onLogout={handleLogout} usuario={user} activeRoute="/profile" />

      <main style={{ padding: '32px 40px 60px', maxWidth: 1280 }} className="main-mobile">
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

        <ProfileCard
          perfil={perfil}
          carregando={carregandoPerfil}
          historico={historico}
          carregandoHistorico={carregandoHistorico}
          temMaisHistorico={!!cursor}
          onCarregarMais={carregarMais}
          onSalvar={salvar}
          salvando={salvando}
          erro={erro}
          sucesso={sucesso}
          onLogout={handleLogout}
        />
      </main>
    </div>
  )
}
