// Valendo — Login (2 variações)
// A: Split-screen cartoon (form esquerda, cenário com Valdo direita)
// B: Card central com Valdo espiando por cima

function LoginA({ tweaks, onSwitchScreen, onSignup }) {
  const [mode, setMode] = React.useState('login'); // login | signup | recover

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1.05fr',
      background: 'var(--bg-page)',
    }}>
      {/* LEFT — form */}
      <div style={{
        padding: '48px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark />
          <span style={{
            fontFamily: 'Nunito', fontWeight: 900, fontSize: 28,
            color: 'var(--primary-dark)', letterSpacing: '-0.02em'
          }}>Valendo</span>
          <span className="chip" style={{
            marginLeft: 8, borderColor: 'var(--primary)', color: 'var(--primary)',
            transform: 'rotate(-3deg)'
          }}>beta</span>
        </div>

        {/* Form */}
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          {mode === 'recover' ? (
            <RecoverForm onBack={() => setMode('login')} />
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{
                  fontFamily: 'Nunito', fontWeight: 900, fontSize: 44,
                  margin: '0 0 4px', color: 'var(--ink)', letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                }}>
                  {mode === 'login' ? (<>Bora duelar,<br/><span className="scribble">gênio?
                    <svg viewBox="0 0 140 14" preserveAspectRatio="none">
                      <path d="M 2 10 q 30 -8 70 -4 t 66 2" stroke="#F5C518" strokeWidth="6" fill="none" strokeLinecap="round" />
                    </svg>
                  </span></>) : (<>Cria tua<br/>conta.</>)}
                </h1>
                <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16, margin: '14px 0 0' }}>
                  {mode === 'login'
                    ? 'Entra, escolhe um tema e mostra quem manda.'
                    : 'Escolhe teu apelido — é assim que os outros te chamam na sala.'}
                </p>
              </div>

              {/* Google */}
              <button className="btn" style={{ width: '100%', background: '#fff', marginBottom: 14 }}>
                <DoodleIcon name="google" size={22} />
                Entrar com Google
              </button>

              <div className="hand-divider">ou com email</div>

              {mode === 'signup' && (
                <div className="input-wrap">
                  <label>Apelido</label>
                  <span className="input-icon"><DoodleIcon name="user" size={20} /></span>
                  <input className="input" placeholder="derek_o_insuperável" />
                </div>
              )}

              <div className="input-wrap">
                <label>Email</label>
                <span className="input-icon"><DoodleIcon name="mail" size={20} /></span>
                <input className="input" type="email" placeholder="voce@faesa.br" />
              </div>

              <div className="input-wrap">
                <label>Senha</label>
                <span className="input-icon"><DoodleIcon name="lock" size={20} /></span>
                <input className="input" type="password" placeholder="••••••••" />
                {mode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: 6 }}>
                    <a className="link-hand" href="#" onClick={(e) => { e.preventDefault(); setMode('recover'); }}>
                      esqueci minha senha
                    </a>
                  </div>
                )}
              </div>

              <button
                className="btn btn-accent"
                style={{ width: '100%', marginTop: 8, fontSize: 18, padding: '16px 22px' }}
                onClick={onSwitchScreen}
              >
                {mode === 'login' ? 'Entrar no Valendo' : 'Criar conta'}
                <DoodleIcon name="play" size={18} strokeColor="var(--accent-ink)" color="var(--accent-ink)" />
              </button>

              <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--muted)', fontWeight: 600 }}>
                {mode === 'login' ? 'Primeira vez por aqui?' : 'Já tens conta?'}{' '}
                <a className="link-hand" href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'signup' : 'login'); }}>
                  {mode === 'login' ? 'cria tua conta' : 'fazer login'}
                </a>
              </p>
            </>
          )}
        </div>

        <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
          FAESA · Desenvolvimento Web 2 · 2025
        </p>
      </div>

      {/* RIGHT — scene */}
      <LoginScene tweaks={tweaks} />
    </div>
  );
}

function LoginScene({ tweaks }) {
  return (
    <div style={{
      background: 'var(--primary)',
      position: 'relative',
      overflow: 'hidden',
      borderLeft: '3px solid var(--ink)',
    }}>
      {/* grid of dots */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Floating doodles */}
      <div style={{ position: 'absolute', top: 60, left: 80 }}>
        <Doodle kind="star" size={56} rotate={-12} />
      </div>
      <div style={{ position: 'absolute', top: 120, right: 90 }}>
        <Doodle kind="spark" size={44} color="#F5C518" rotate={10} />
      </div>
      <div style={{ position: 'absolute', bottom: 140, left: 50 }}>
        <Doodle kind="squiggle" size={70} color="#F5C518" rotate={-8} />
      </div>
      <div style={{ position: 'absolute', bottom: 90, right: 60 }}>
        <Doodle kind="zigzag" size={80} color="#F5C518" rotate={6} />
      </div>
      <div style={{ position: 'absolute', top: 340, left: 40 }}>
        <Doodle kind="dots" size={60} color="#F5C518" />
      </div>

      {/* VS badge floating */}
      <div style={{
        position: 'absolute', top: 80, right: 140,
        background: 'var(--accent)', border: '3px solid var(--ink)',
        width: 84, height: 84, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '4px 4px 0 var(--ink)',
        transform: 'rotate(-8deg)',
        fontFamily: 'Nunito', fontWeight: 900, fontSize: 32,
        color: 'var(--accent-ink)',
      }}>VS</div>

      {/* Speech bubble */}
      <div style={{
        position: 'absolute', top: 200, left: 60,
        background: '#fff', border: '3px solid var(--ink)',
        padding: '12px 18px', borderRadius: 18,
        boxShadow: '4px 4px 0 var(--ink)',
        fontFamily: 'Caveat', fontSize: 26, fontWeight: 700,
        color: 'var(--ink)',
        transform: 'rotate(-4deg)',
        maxWidth: 220,
      }}>
        bora ver quem sabe mais?
        <div style={{
          position: 'absolute', bottom: -16, left: 40,
          width: 24, height: 24,
          background: '#fff',
          borderRight: '3px solid var(--ink)',
          borderBottom: '3px solid var(--ink)',
          transform: 'rotate(45deg)',
        }} />
      </div>

      {/* Mascot */}
      {tweaks.mascot && (
        <div style={{
          position: 'absolute', bottom: 30, left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <Valdo size={320} expression="idle" accessory="book" tilt={-3} />
        </div>
      )}

      {/* Stats/trust badges floating */}
      <div style={{
        position: 'absolute', top: 380, right: 40,
        background: '#fff', border: '3px solid var(--ink)',
        padding: '12px 16px', borderRadius: 14,
        boxShadow: '3px 3px 0 var(--ink)',
        transform: 'rotate(5deg)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Doodle kind="lightning" size={30} />
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, color: 'var(--ink)', lineHeight: 1 }}>8.421</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>duelos hoje</div>
        </div>
      </div>

      {/* Card with mini "duelo ao vivo" */}
      <div className="doodle-card" style={{
        position: 'absolute', bottom: 40, right: 30,
        padding: 14, background: '#fff',
        transform: 'rotate(4deg)',
        width: 220,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--red)', animation: 'pulse 1.2s infinite',
          }} />
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', color: 'var(--red)', textTransform: 'uppercase' }}>ao vivo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7C3AED', border: '2px solid var(--ink)' }} />
            <span style={{ fontWeight: 800, fontSize: 13 }}>leo_z</span>
          </div>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 20, color: 'var(--orange)' }}>VS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 13 }}>mari.04</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#E8601C', border: '2px solid var(--ink)' }} />
          </div>
        </div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '2px dashed var(--border)', fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>
          História · Segunda Guerra
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

function RecoverForm({ onBack }) {
  return (
    <div>
      <h1 style={{
        fontFamily: 'Nunito', fontWeight: 900, fontSize: 40,
        margin: '0 0 8px', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1.05,
      }}>Esqueceu<br/>a senha?</h1>
      <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16, margin: '10px 0 28px' }}>
        Acontece. Coloca teu email que a gente manda um link de recuperação.
      </p>
      <div className="input-wrap">
        <label>Email</label>
        <span className="input-icon"><DoodleIcon name="mail" size={20} /></span>
        <input className="input" type="email" placeholder="voce@faesa.br" />
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
        Enviar link mágico
      </button>
      <p style={{ textAlign: 'center', marginTop: 22 }}>
        <a className="link-hand" href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>← voltar ao login</a>
      </p>
    </div>
  );
}

function LogoMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" style={{ transform: 'rotate(-4deg)' }}>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#1B4FBE" stroke="#1A1A2E" strokeWidth="3" />
      <text x="24" y="33" textAnchor="middle" fontFamily="Nunito" fontWeight="900" fontSize="24" fill="#F5C518">V</text>
      <circle cx="38" cy="10" r="4" fill="#F5C518" stroke="#1A1A2E" strokeWidth="2" />
    </svg>
  );
}

window.LoginA = LoginA;
window.LogoMark = LogoMark;
