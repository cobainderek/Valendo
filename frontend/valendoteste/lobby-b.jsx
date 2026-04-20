// Valendo — Lobby B: Top-nav, bento layout, create-room in center card
// Mais "playground" — dois panels laterais, tema em destaque central

function LobbyB({ tweaks, onBack }) {
  const [selected, setSelected] = React.useState('historia');
  const [mode, setMode] = React.useState('privada'); // privada | publica | solo
  const [rounds, setRounds] = React.useState(10);
  const [time, setTime] = React.useState(20);

  const temaAtivo = window.TEMAS.find(t => t.id === selected) || window.TEMAS[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* TOP BAR */}
      <header style={{
        background: 'var(--primary)',
        borderBottom: '3px solid var(--ink)',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark />
            <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 24, color: '#fff', letterSpacing: '-0.02em' }}>Valendo</span>
          </div>
          <nav style={{ display: 'flex', gap: 4 }}>
            {[
              { label: 'Jogar', active: true },
              { label: 'Amigos' },
              { label: 'Ranking' },
              { label: 'Apostilas' },
            ].map((item) => (
              <a key={item.label} href="#" style={{
                padding: '8px 14px', borderRadius: 10,
                textDecoration: 'none',
                color: item.active ? 'var(--accent-ink)' : '#fff',
                background: item.active ? 'var(--accent)' : 'transparent',
                border: item.active ? '2px solid var(--ink)' : '2px solid transparent',
                boxShadow: item.active ? '2px 2px 0 var(--ink)' : 'none',
                fontWeight: 800, fontSize: 14,
              }}>{item.label}</a>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="sticker" style={{ background: '#F5C518' }}>
            <Doodle kind="lightning" size={14} /> 12 dias de sequência
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 14px 6px 6px',
            background: 'rgba(255,255,255,0.12)',
            border: '2px solid var(--ink)', borderRadius: 999,
            color: '#fff', fontWeight: 800, fontSize: 14,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8601C', border: '2px solid var(--ink)', display: 'grid', placeItems: 'center', fontWeight: 900 }}>D</div>
            derek · 1.840 pts
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, padding: 32, maxWidth: 1360, margin: '0 auto' }}>
        {/* MAIN */}
        <main>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Caveat', fontSize: 22, color: 'var(--muted)', margin: 0, fontWeight: 700 }}>
              ↓ escolhe teu veneno
            </p>
            <h1 style={{
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 36,
              margin: '2px 0 0', letterSpacing: '-0.03em',
            }}>
              Monta a tua sala.
            </h1>
          </div>

          {/* Mode toggle */}
          <div style={{
            display: 'flex', gap: 10, marginBottom: 22,
            flexWrap: 'wrap',
          }}>
            {[
              { id: 'privada', label: 'Sala privada', sub: 'código para amigos', icon: 'lock' },
              { id: 'publica', label: 'Pública', sub: 'matchmaking', icon: 'people' },
              { id: 'solo', label: 'Solo vs IA', sub: 'treino', icon: 'atom' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className="doodle-card"
                style={{
                  flex: 1, minWidth: 180,
                  padding: '14px 18px',
                  background: mode === m.id ? 'var(--accent)' : 'var(--bg-card)',
                  color: mode === m.id ? 'var(--accent-ink)' : 'var(--ink)',
                  cursor: 'pointer', textAlign: 'left',
                  border: '2.5px solid var(--ink)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <DoodleIcon name={m.icon} size={26} strokeColor={mode === m.id ? 'var(--accent-ink)' : 'var(--ink)'} color={mode === m.id ? 'transparent' : '#fff'} />
                <div>
                  <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 15 }}>{m.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Tema grid */}
          <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 16, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>
            escolhe o tema
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
            {window.TEMAS.map((t, i) => {
              const active = selected === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className="doodle-card"
                  style={{
                    padding: 14, textAlign: 'left', cursor: 'pointer',
                    background: active ? 'var(--primary)' : 'var(--bg-card)',
                    color: active ? '#fff' : 'var(--ink)',
                    transform: active ? 'rotate(0deg) translate(-1px,-1px)' : `rotate(${[-0.6, 0.5, -0.4, 0.4, -0.5, 0.3][i % 6]}deg)`,
                    boxShadow: active ? '5px 5px 0 var(--ink)' : '4px 4px 0 var(--ink)',
                    transition: 'all .12s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: active ? '#fff' : t.bg,
                      border: '2.5px solid var(--ink)',
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                      <DoodleIcon name={t.icon} size={26} color={t.color} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 15 }}>{t.nome}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.sub}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Config sliders */}
          <div className="doodle-card" style={{ padding: 20, background: 'var(--bg-cream)' }}>
            <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 16, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>
              configuração da sala
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
              <Stepper label="Rodadas" value={rounds} onChange={setRounds} min={5} max={20} step={5} unit="perguntas" />
              <Stepper label="Tempo por pergunta" value={time} onChange={setTime} min={10} max={30} step={5} unit="segundos" />
            </div>
          </div>
        </main>

        {/* SIDE — Summary card */}
        <aside>
          <div style={{ position: 'sticky', top: 94 }}>
            <div className="doodle-card" style={{ padding: 22, position: 'relative', overflow: 'visible' }}>
              {/* Tape */}
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%) rotate(-3deg)',
                width: 100, height: 24,
                background: 'rgba(245,197,24,0.85)',
                border: '2px solid var(--ink)',
              }} />

              <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 14, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', textAlign: 'center' }}>
                tua sala
              </h3>

              {tweaks.mascot && (
                <div style={{ textAlign: 'center', marginBottom: 6, marginTop: -8 }}>
                  <Valdo size={130} expression="idle" accessory="pencil" tilt={-6} />
                </div>
              )}

              {/* Selected tema preview */}
              <div style={{
                border: '2.5px solid var(--ink)', borderRadius: 12,
                padding: 14, background: temaAtivo.bg,
                marginBottom: 16, textAlign: 'center',
              }}>
                <DoodleIcon name={temaAtivo.icon} size={44} color={temaAtivo.color} />
                <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 20, marginTop: 6, color: 'var(--ink)' }}>{temaAtivo.nome}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', opacity: 0.7 }}>{temaAtivo.sub}</div>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                marginBottom: 16,
              }}>
                <StatBox label="Rodadas" value={rounds} />
                <StatBox label="Segundos" value={time} />
              </div>

              {/* Room code */}
              <div style={{
                background: 'var(--primary)', color: '#fff',
                border: '2.5px solid var(--ink)', borderRadius: 12,
                padding: '14px 16px', marginBottom: 16,
                boxShadow: '3px 3px 0 var(--ink)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.85 }}>
                  Código da sala
                </div>
                <div style={{
                  fontFamily: 'Nunito', fontWeight: 900, fontSize: 32,
                  letterSpacing: '0.15em', color: '#F5C518', marginTop: 2,
                }}>
                  7F2·X91
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, marginTop: 4 }}>
                  compartilha com teus amigos
                </div>
              </div>

              <button className="btn btn-accent" style={{ width: '100%', fontSize: 17, padding: '15px 22px' }}>
                <DoodleIcon name="play" size={18} strokeColor="var(--accent-ink)" color="var(--accent-ink)" />
                Criar e entrar
              </button>

              {/* Copy hand-written */}
              <p style={{
                fontFamily: 'Caveat', fontSize: 19, color: 'var(--muted)',
                textAlign: 'center', margin: '14px 0 0', fontWeight: 700,
                transform: 'rotate(-1deg)',
              }}>
                ↑ a IA gera as perguntas enquanto<br/>teus amigos entram
              </p>
            </div>

            {/* Apostila upload mini-card */}
            <div className="doodle-card" style={{ padding: 16, marginTop: 18, background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: '#DBEAFE', border: '2.5px solid var(--ink)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <DoodleIcon name="folder" size={26} color="#1B4FBE" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 15 }}>Sobe tua apostila</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>PDF &rarr; IA gera perguntas do conteúdo real</div>
                </div>
              </div>
              <button className="btn" style={{ width: '100%', marginTop: 12, padding: '10px 14px', fontSize: 13 }}>
                <DoodleIcon name="plus" size={16} /> Escolher PDF
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>← voltar ao login</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stepper({ label, value, onChange, min, max, step, unit }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: '2.5px solid var(--ink)', borderRadius: 12,
        background: '#fff', padding: '6px 10px',
        boxShadow: '2px 2px 0 var(--ink)',
      }}>
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          style={{
            width: 32, height: 32, border: '2px solid var(--ink)', borderRadius: 8,
            background: 'var(--primary-soft)', fontWeight: 900, cursor: 'pointer',
            fontFamily: 'Nunito', fontSize: 18,
          }}
        >−</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 26, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{unit}</div>
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          style={{
            width: 32, height: 32, border: '2px solid var(--ink)', borderRadius: 8,
            background: 'var(--accent)', fontWeight: 900, cursor: 'pointer',
            fontFamily: 'Nunito', fontSize: 18, color: 'var(--accent-ink)',
          }}
        >+</button>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{
      border: '2.5px solid var(--ink)', borderRadius: 10,
      background: '#fff', padding: '10px 12px', textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 22, color: 'var(--primary)' }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );
}

window.LobbyB = LobbyB;
