// Valendo — Login B: card central com Valdo espiando por cima

function LoginB({ tweaks, onSwitchScreen }) {
  const [mode, setMode] = React.useState('login');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--primary)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      {/* Paper texture with dots */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Floating doodles scattered */}
      <div style={{ position: 'absolute', top: '8%', left: '8%' }}><Doodle kind="star" size={50} rotate={-14} /></div>
      <div style={{ position: 'absolute', top: '12%', right: '10%' }}><Doodle kind="zigzag" size={80} color="#F5C518" rotate={8} /></div>
      <div style={{ position: 'absolute', bottom: '12%', left: '10%' }}><Doodle kind="squiggle" size={70} color="#F5C518" rotate={-6} /></div>
      <div style={{ position: 'absolute', bottom: '8%', right: '8%' }}><Doodle kind="spark" size={50} color="#F5C518" rotate={12} /></div>
      <div style={{ position: 'absolute', top: '40%', left: '5%' }}><Doodle kind="dots" size={60} color="#F5C518" /></div>
      <div style={{ position: 'absolute', top: '46%', right: '6%' }}><Doodle kind="circle" size={40} color="#F5C518" rotate={0} /></div>

      {/* Logo top */}
      <div style={{
        position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <LogoMark />
        <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 28, color: '#fff', letterSpacing: '-0.02em' }}>
          Valendo
        </span>
      </div>

      {/* Card */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
        {/* Mascot peeking */}
        {tweaks.mascot && (
          <div style={{
            position: 'absolute',
            top: -140, right: -60,
            zIndex: 2,
            pointerEvents: 'none',
          }}>
            <Valdo size={200} expression="idle" accessory={null} tilt={10} />
          </div>
        )}

        <div className="doodle-card" style={{ padding: '36px 32px', background: 'var(--bg-card)', position: 'relative' }}>
          {/* Tape decoration */}
          <div style={{
            position: 'absolute', top: -14, left: 40,
            width: 80, height: 26,
            background: 'rgba(245,197,24,0.85)',
            border: '2px solid var(--ink)',
            transform: 'rotate(-4deg)',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
          }} />
          <div style={{
            position: 'absolute', top: -14, right: 60,
            width: 70, height: 24,
            background: 'rgba(245,197,24,0.85)',
            border: '2px solid var(--ink)',
            transform: 'rotate(6deg)',
          }} />

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: 24,
            background: 'var(--bg-page)', padding: 5,
            border: '2.5px solid var(--ink)', borderRadius: 12,
          }}>
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '10px 12px',
                  border: 'none', borderRadius: 8,
                  fontFamily: 'Nunito', fontWeight: 800, fontSize: 14,
                  cursor: 'pointer',
                  background: mode === m ? 'var(--primary)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--muted)',
                  boxShadow: mode === m ? '2px 2px 0 var(--ink)' : 'none',
                  border: mode === m ? '2px solid var(--ink)' : '2px solid transparent',
                }}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <h2 style={{
            fontFamily: 'Nunito', fontWeight: 900, fontSize: 30,
            margin: '0 0 6px', letterSpacing: '-0.02em',
          }}>
            {mode === 'login' ? (<>Boa, te vi!</>) : (<>Novo por aqui</>)}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 15, fontWeight: 600, margin: '0 0 20px' }}>
            {mode === 'login' ? 'Entra e mostra quem manda na sala.' : 'Escolhe teu apelido e bora.'}
          </p>

          {mode === 'signup' && (
            <div className="input-wrap">
              <label>Apelido</label>
              <span className="input-icon"><DoodleIcon name="user" size={20} /></span>
              <input className="input" placeholder="teu_nome_de_guerra" />
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
          </div>

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 12 }}>
              <a className="link-hand" href="#">esqueci minha senha</a>
            </div>
          )}

          <button
            className="btn btn-accent"
            style={{ width: '100%', fontSize: 17, padding: '15px 22px' }}
            onClick={onSwitchScreen}
          >
            {mode === 'login' ? 'Entrar no duelo' : 'Criar minha conta'}
            <DoodleIcon name="play" size={16} strokeColor="var(--accent-ink)" color="var(--accent-ink)" />
          </button>

          <div className="hand-divider">ou</div>

          <button className="btn" style={{ width: '100%', background: '#fff' }}>
            <DoodleIcon name="google" size={20} />
            Entrar com Google
          </button>

          {/* Bottom social proof */}
          <div style={{
            marginTop: 24, paddingTop: 18, borderTop: '2px dashed var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 13, fontWeight: 700, color: 'var(--muted)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Doodle kind="lightning" size={18} /> 8.421 duelos hoje
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Doodle kind="star" size={18} /> 2.4k jogadores
            </span>
          </div>
        </div>

        {/* Caveat caption */}
        <p style={{
          fontFamily: 'Caveat', fontSize: 22, color: '#fff',
          textAlign: 'center', marginTop: 18, fontWeight: 700,
          opacity: 0.9, transform: 'rotate(-1deg)',
        }}>
          FAESA · 2025 — feito com café e WebSockets
        </p>
      </div>
    </div>
  );
}

window.LoginB = LoginB;
