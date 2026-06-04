'use client'

import { useEffect, useRef, useState } from 'react'
import { DoodleIcon } from '@/components/ui/DoodleIcon'
import { renderizarBotaoGoogle } from '@/lib/google'

interface LoginFormProps {
  onLogin: (email: string, senha: string) => void
  onSignup: (apelido: string, email: string, senha: string) => void
  onRecover?: (email: string) => Promise<void>
  /** Recebe o ID Token do Google — se ausente, o botão Google é ocultado. */
  onGoogleToken?: (idToken: string) => void
  carregando?: boolean
  carregandoGoogle?: boolean
  erro?: string
}

export function LoginForm({
  onLogin,
  onSignup,
  onRecover,
  onGoogleToken,
  carregando = false,
  carregandoGoogle = false,
  erro = '',
}: LoginFormProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'recover'>('login')
  const [apelido, setApelido] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [googleErro, setGoogleErro] = useState('')
  const googleRef = useRef<HTMLDivElement>(null)

  // Renderiza o botão oficial do Google (invisível) por cima do botão doodle.
  // Reexecuta ao voltar do modo "recover", quando o container remonta vazio.
  useEffect(() => {
    const el = googleRef.current
    if (!onGoogleToken || !el || el.childElementCount > 0) return
    renderizarBotaoGoogle(el, onGoogleToken).catch((e: Error) => {
      setGoogleErro(e.message)
    })
  }, [onGoogleToken, mode])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'login') {
      onLogin(email, senha)
    } else if (mode === 'signup') {
      onSignup(apelido, email, senha)
    }
  }

  if (mode === 'recover') {
    return <RecoverForm onBack={() => setMode('login')} onRecover={onRecover} />
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: 44,
            margin: '0 0 4px',
            color: 'var(--ink)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
          }}
        >
          {mode === 'login' ? (
            <>
              Bora duelar,<br />
              <span className="scribble">
                gênio?
                <svg viewBox="0 0 140 14" preserveAspectRatio="none">
                  <path d="M 2 10 q 30 -8 70 -4 t 66 2" stroke="#F5C518" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </>
          ) : (
            <>Cria tua<br />conta.</>
          )}
        </h1>
        <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16, margin: '14px 0 0' }}>
          {mode === 'login'
            ? 'Entra, escolhe um tema e mostra quem manda.'
            : 'Escolhe teu apelido — é assim que os outros te chamam na sala.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Google — o botão doodle é só o visual; o botão real do GIS fica
            invisível por cima e recebe o clique (abre o popup sem bloqueio). */}
        {onGoogleToken && (
          <>
            <div style={{ position: 'relative', marginBottom: googleErro ? 6 : 14 }}>
              <button
                type="button"
                tabIndex={-1}
                className="btn"
                style={{ width: '100%', background: '#fff' }}
                disabled={carregandoGoogle}
              >
                <DoodleIcon name="google" size={22} />
                {carregandoGoogle ? 'Conectando com o Google...' : 'Entrar com Google'}
              </button>
              {!carregandoGoogle && (
                <div
                  ref={googleRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.0001,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              )}
            </div>
            {googleErro && (
              <p style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13, textAlign: 'center', margin: '0 0 12px' }}>
                {googleErro}
              </p>
            )}
            <div className="hand-divider">ou com email</div>
          </>
        )}

        {mode === 'signup' && (
          <div className="input-wrap">
            <label>Apelido</label>
            <span className="input-icon"><DoodleIcon name="user" size={20} /></span>
            <input
              className="input"
              placeholder="derek_o_insuperável"
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              required
            />
          </div>
        )}

        <div className="input-wrap">
          <label>Email</label>
          <span className="input-icon"><DoodleIcon name="mail" size={20} /></span>
          <input
            className="input"
            type="email"
            placeholder="voce@faesa.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-wrap">
          <label>Senha</label>
          <span className="input-icon"><DoodleIcon name="lock" size={20} /></span>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <a
                className="link-hand"
                href="#"
                onClick={(e) => { e.preventDefault(); setMode('recover') }}
              >
                esqueci minha senha
              </a>
            </div>
          )}
        </div>

        {erro && (
          <p style={{ color: 'var(--red)', fontWeight: 700, fontSize: 14, textAlign: 'center', marginBottom: 12 }}>
            {erro}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-accent"
          style={{ width: '100%', marginTop: 8, fontSize: 18, padding: '16px 22px' }}
          disabled={carregando}
        >
          {carregando
            ? 'Entrando...'
            : mode === 'login' ? 'Entrar no Valendo' : 'Criar conta'}
          <DoodleIcon name="play" size={18} strokeColor="var(--accent-ink)" color="var(--accent-ink)" />
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--muted)', fontWeight: 600 }}>
        {mode === 'login' ? 'Primeira vez por aqui?' : 'Já tens conta?'}{' '}
        <a
          className="link-hand"
          href="#"
          onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'signup' : 'login') }}
        >
          {mode === 'login' ? 'cria tua conta' : 'fazer login'}
        </a>
      </p>
    </>
  )
}

function RecoverForm({ onBack, onRecover }: { onBack: () => void; onRecover?: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !onRecover) return
    setEnviando(true)
    await onRecover(email)
    setEnviando(false)
    setEnviado(true)
  }

  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 40,
          margin: '0 0 8px',
          color: 'var(--ink)',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
        }}
      >
        Esqueceu<br />a senha?
      </h1>
      <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16, margin: '10px 0 28px' }}>
        Acontece. Coloca teu email que a gente manda um link de recuperação.
      </p>

      {enviado ? (
        <div style={{
          background: '#e8f8ee',
          border: '2px solid var(--green)',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
          <p style={{ color: '#1a7a3a', fontWeight: 700, fontSize: 14, margin: 0 }}>
            Se esse email estiver cadastrado, enviamos um link de recuperação!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="input-wrap">
            <label>Email</label>
            <span className="input-icon"><DoodleIcon name="mail" size={20} /></span>
            <input
              className="input"
              type="email"
              placeholder="voce@faesa.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar link mágico'}
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: 22 }}>
        <a className="link-hand" href="#" onClick={(e) => { e.preventDefault(); onBack() }}>
          ← voltar ao login
        </a>
      </p>
    </div>
  )
}
