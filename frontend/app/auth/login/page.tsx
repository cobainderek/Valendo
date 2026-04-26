'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogoMark } from '@/components/ui/LogoMark'
import { LoginForm } from '@/components/auth/LoginForm'
import { LoginScene } from '@/components/auth/LoginScene'
import { login, register, recoverPassword } from '@/services/auth'
import { useAuthStore } from '@/lib/store/useAuthStore'

export default function LoginPage() {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()
  const storeLogin = useAuthStore((s) => s.login)

  async function handleLogin(email: string, senha: string) {
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos!')
      return
    }

    setCarregando(true)
    setErro('')

    try {
      const dados = await login(email, senha)
      storeLogin(dados.access_token, dados.user)
      router.push('/lobby')
    } catch (err) {
      if (err instanceof Error && err.message) {
        setErro(err.message)
      } else {
        setErro('Erro de conexão. Verifique se o servidor está rodando!')
      }
    } finally {
      setCarregando(false)
    }
  }

  async function handleSignup(apelido: string, email: string, senha: string) {
    if (!apelido.trim() || !email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos!')
      return
    }

    setCarregando(true)
    setErro('')

    try {
      const dados = await register({ name: apelido, tag: apelido, email, password: senha })
      storeLogin(dados.access_token, dados.user)
      router.push('/lobby')
    } catch (err) {
      if (err instanceof Error && err.message) {
        setErro(err.message)
      } else {
        setErro('Erro de conexão. Verifique se o servidor está rodando!')
      }
    } finally {
      setCarregando(false)
    }
  }

  async function handleRecover(email: string) {
    try {
      await recoverPassword(email)
    } catch {
      // Sempre mostra sucesso para evitar enumeração de emails
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1.05fr',
        background: 'var(--bg-page)',
      }}
    >
      {/* LEFT — form */}
      <div
        style={{
          padding: '48px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark />
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 28,
              color: 'var(--primary-dark)',
              letterSpacing: '-0.02em',
            }}
          >
            Valendo
          </span>
          <span
            className="chip"
            style={{
              marginLeft: 8,
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              transform: 'rotate(-3deg)',
            }}
          >
            beta
          </span>
        </div>

        {/* Form */}
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <LoginForm
            onLogin={handleLogin}
            onSignup={handleSignup}
            onRecover={handleRecover}
            carregando={carregando}
            erro={erro}
          />
        </div>

        <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
          FAESA · Desenvolvimento Web 2 · 2025
        </p>
      </div>

      {/* RIGHT — scene */}
      <LoginScene />
    </div>
  )
}
