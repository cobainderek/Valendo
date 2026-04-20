// Valendo — Lobby A: Grid-first com sidebar esquerda
// Header azul, sidebar com perfil/ranking, grid de temas centro, "Criar sala" destacado

const TEMAS = [
  { id: 'historia', nome: 'História', icon: 'sword', color: '#7C3AED', bg: '#EDE9FE', duelos: '2.1k', sub: 'Civilizações, guerras, Brasil' },
  { id: 'bio', nome: 'Biologia', icon: 'microscope', color: '#059669', bg: '#DCFCE7', duelos: '1.8k', sub: 'Células, eco, gente é bicho' },
  { id: 'geo', nome: 'Geografia', icon: 'compass', color: '#D97706', bg: '#FEF3C7', duelos: '1.2k', sub: 'Mapas, clima, população' },
  { id: 'fisica', nome: 'Física', icon: 'atom', color: '#7C3AED', bg: '#EDE9FE', duelos: '960', sub: 'Mecânica, ondas, ótica' },
  { id: 'mat', nome: 'Matemática', icon: 'ruler', color: '#DB2777', bg: '#FCE7F3', duelos: '3.4k', sub: 'Cálculo, álgebra, geometria' },
  { id: 'apostila', nome: 'Minha apostila', icon: 'folder', color: '#1B4FBE', bg: '#DBEAFE', duelos: 'novo', sub: 'IA gera questões do teu PDF' },
];

function LobbyA({ tweaks, onBack }) {
  const [search, setSearch] = React.useState('');
  const temas = TEMAS.filter(t => t.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'grid', gridTemplateColumns: '280px 1fr' }}>
      {/* SIDEBAR */}
      <aside style={{
        background: 'var(--primary)', color: '#fff',
        padding: '22px 20px',
        borderRight: '3px solid var(--ink)',
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <LogoMark />
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 24, color: '#fff', letterSpacing: '-0.02em' }}>Valendo</span>
        </div>

        {/* Profile card */}
        <div style={{
          background: 'rgba(255,255,255,0.10)',
          border: '2.5px solid #1A1A2E',
          borderRadius: 14,
          padding: 14,
          boxShadow: '3px 3px 0 var(--ink)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#E8601C', border: '2.5px solid var(--ink)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 22, color: '#fff',
            }}>D</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15 }}>derek_o_insup</div>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>@derek #4821</div>
            </div>
          </div>
          <div style={{
            marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            <span className="sticker" style={{ background: '#F5C518' }}>
              <Doodle kind="star" size={14} /> Destaque
            </span>
            <span className="sticker" style={{ background: '#fff', color: 'var(--ink)' }}>
              <Doodle kind="lightning" size={14} /> 12 dias
            </span>
          </div>
          {/* XP bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              <span>Pontos da semana</span>
              <span style={{ color: '#F5C518' }}>1.840</span>
            </div>
            <div style={{
              height: 12, background: 'rgba(0,0,0,0.25)',
              border: '2px solid var(--ink)', borderRadius: 999, overflow: 'hidden',
            }}>
              <div style={{ width: '62%', height: '100%', background: '#F5C518' }} />
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4, fontWeight: 700 }}>Faltam 1.160 pra Lendário</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { label: 'Jogar agora', icon: 'swords', active: true },
            { label: 'Meus amigos', icon: 'people' },
            { label: 'Ranking', icon: 'trophy' },
            { label: 'Minhas apostilas', icon: 'folder' },
          ].map((item) => (
            <a key={item.label} href="#" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              textDecoration: 'none',
              color: item.active ? 'var(--accent-ink)' : '#fff',
              background: item.active ? 'var(--accent)' : 'transparent',
              border: item.active ? '2.5px solid var(--ink)' : '2.5px solid transparent',
              boxShadow: item.active ? '2px 2px 0 var(--ink)' : 'none',
              fontWeight: 800, fontSize: 14,
            }}>
              <DoodleIcon name={item.icon} size={20} strokeColor={item.active ? 'var(--accent-ink)' : '#fff'} color="transparent" />
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: '#1A1A2E', boxShadow: '2px 2px 0 var(--ink)' }} onClick={onBack}>
            Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ padding: '28px 40px 60px', maxWidth: 1200 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <p style={{ fontFamily: 'Caveat', fontSize: 22, color: 'var(--muted)', margin: 0, fontWeight: 700 }}>
              quarta, 19 de abril
            </p>
            <h1 style={{
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 40,
              margin: '2px 0 0', letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              Bem-vindo de volta, <span className="scribble">derek
                <svg viewBox="0 0 100 14" preserveAspectRatio="none">
                  <path d="M 2 10 q 24 -8 50 -4 t 46 2" stroke="#F5C518" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </div>
          <div style={{ position: 'relative' }}>
            <span className="input-icon" style={{ left: 14, transform: 'translateY(-50%)', top: '50%' }}>
              <DoodleIcon name="search" size={20} />
            </span>
            <input
              className="input"
              placeholder="Buscar tema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
            />
          </div>
        </div>

        {/* Hero: criar sala */}
        <div className="doodle-card" style={{
          background: 'var(--primary)', color: '#fff',
          padding: 28, marginBottom: 32,
          display: 'grid', gridTemplateColumns: tweaks.mascot ? '1fr 200px' : '1fr',
          alignItems: 'center', gap: 20,
          overflow: 'hidden', position: 'relative',
        }}>
          {/* floating doodles inside hero */}
          <div style={{ position: 'absolute', top: 14, right: 240, opacity: 0.5 }}>
            <Doodle kind="star" size={36} color="#F5C518" rotate={-10} />
          </div>
          <div style={{ position: 'absolute', bottom: 18, left: 360, opacity: 0.4 }}>
            <Doodle kind="spark" size={28} color="#F5C518" />
          </div>

          <div>
            <span className="sticker" style={{ background: '#F5C518', marginBottom: 14, display: 'inline-flex' }}>
              <Doodle kind="lightning" size={14} /> Sala pronta em 3 cliques
            </span>
            <h2 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 34, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
              Cria tua sala e<br/>chama a galera.
            </h2>
            <p style={{ opacity: 0.9, fontSize: 15, fontWeight: 600, margin: '0 0 18px', maxWidth: 460 }}>
              Escolhe um tema, configura o tempo de cada pergunta e recebe um código pra teus amigos entrarem.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-accent" style={{ fontSize: 16, padding: '14px 22px' }}>
                <DoodleIcon name="plus" size={18} strokeColor="var(--accent-ink)" />
                Criar sala privada
              </button>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: 'var(--ink)', fontSize: 16 }}>
                <DoodleIcon name="people" size={18} strokeColor="#fff" color="transparent" />
                Matchmaking público
              </button>
            </div>
          </div>
          {tweaks.mascot && (
            <div style={{ justifySelf: 'end' }}>
              <Valdo size={200} expression="cheer" accessory="trophy" tilt={6} />
            </div>
          )}
        </div>

        {/* Temas grid */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 22, margin: 0, letterSpacing: '-0.01em' }}>
            Temas em alta
          </h3>
          <a className="link-hand" href="#">ver todos</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {temas.map((t, i) => (
            <div key={t.id} className="doodle-card" style={{
              padding: 20, cursor: 'pointer',
              transform: `rotate(${[-0.8, 0.6, -0.4, 0.8, -0.6, 0.4][i % 6]}deg)`,
              transition: 'transform .12s ease, box-shadow .12s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--ink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${[-0.8, 0.6, -0.4, 0.8, -0.6, 0.4][i % 6]}deg)`; e.currentTarget.style.boxShadow = '4px 4px 0 var(--ink)'; }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: t.bg, border: '2.5px solid var(--ink)',
                display: 'grid', placeItems: 'center',
                boxShadow: '2px 2px 0 var(--ink)',
                marginBottom: 14,
              }}>
                <DoodleIcon name={t.icon} size={32} color={t.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <h4 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 20, margin: 0, letterSpacing: '-0.01em' }}>
                  {t.nome}
                </h4>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t.duelos} {typeof t.duelos === 'string' && t.duelos !== 'novo' ? 'duelos' : ''}
                </span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, margin: '6px 0 14px' }}>{t.sub}</p>
              <button className="btn btn-accent" style={{ padding: '10px 16px', fontSize: 14 }}>
                Duelar <DoodleIcon name="play" size={14} strokeColor="var(--accent-ink)" color="var(--accent-ink)" />
              </button>
            </div>
          ))}
        </div>

        {/* Ao vivo / amigos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 22, marginTop: 32 }}>
          <div className="doodle-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 18, margin: 0 }}>Amigos duelando agora</h3>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 900, color: 'var(--red)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} /> ao vivo
              </span>
            </div>
            {[
              { a: 'leo_z', b: 'mari.04', t: 'História · Segunda Guerra', ac: '#7C3AED', bc: '#E8601C' },
              { a: 'bia.99', b: 'rafa_x', t: 'Biologia · Célula', ac: '#059669', bc: '#1B4FBE' },
              { a: 'andre', b: 'cami.s', t: 'Matemática · Integrais', ac: '#DB2777', bc: '#F5C518' },
            ].map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderTop: i === 0 ? 'none' : '2px dashed var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: m.ac, border: '2px solid var(--ink)' }} />
                  <span style={{ fontWeight: 800 }}>{m.a}</span>
                </div>
                <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 18, color: 'var(--orange)' }}>VS</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800 }}>{m.b}</span>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: m.bc, border: '2px solid var(--ink)' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, minWidth: 180, textAlign: 'right' }}>{m.t}</div>
                <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }}>Assistir</button>
              </div>
            ))}
          </div>

          <div className="doodle-card" style={{ padding: 20, background: 'var(--bg-cream)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Doodle kind="trophy" size={28} />
              <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 18, margin: 0 }}>Ranking da semana</h3>
            </div>
            {[
              { p: 1, n: 'mari.04', s: 3420, me: false },
              { p: 2, n: 'leo_z', s: 2980, me: false },
              { p: 3, n: 'derek_o_insup', s: 1840, me: true },
              { p: 4, n: 'bia.99', s: 1520, me: false },
            ].map((r) => (
              <div key={r.p} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', marginBottom: 6,
                background: r.me ? 'var(--primary)' : '#fff',
                color: r.me ? '#fff' : 'var(--ink)',
                border: '2.5px solid var(--ink)', borderRadius: 10,
                boxShadow: r.me ? '2px 2px 0 var(--ink)' : 'none',
              }}>
                <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 18, width: 24 }}>{r.p}</span>
                <span style={{ flex: 1, fontWeight: 800 }}>{r.n}{r.me && ' (voceu0302)'}</span>
                <span style={{ fontFamily: 'Nunito', fontWeight: 900, color: r.me ? '#F5C518' : 'var(--primary)' }}>
                  {r.s.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

window.LobbyA = LobbyA;
window.TEMAS = TEMAS;
