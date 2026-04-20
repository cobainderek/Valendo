'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogoMark } from '@/components/ui/LogoMark'
import { LoginForm } from '@/components/auth/LoginForm'
import { LoginScene } from '@/components/auth/LoginScene'

export default function LoginPage() {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function handleLogin(email: string, senha: string) {
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos!')
      return
    }

    setCarregando(true)
    setErro('')

    try {
      const resposta = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })

      if (!resposta.ok) {
        setErro('Email ou senha inválidos!')
        return
      }

      const dados = await resposta.json()
      localStorage.setItem('token', dados.access_token)
      router.push('/lobby')
    } catch {
      setErro('Erro de conexão. Verifique se o servidor está rodando!')
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
      const resposta = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: apelido, email, senha }),
      })

      if (!resposta.ok) {
        const data = await resposta.json().catch(() => ({}))
        setErro(data.message || 'Erro ao criar conta.')
        return
      }

      // Auto-login after registration
      await handleLogin(email, senha)
    } catch {
      setErro('Erro de conexão. Verifique se o servidor está rodando!')
    } finally {
      setCarregando(false)
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