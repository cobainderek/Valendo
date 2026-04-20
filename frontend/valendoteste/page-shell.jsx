// Shared page shell — wraps a single screen component with tweaks + nav pill
function PageShell({ Screen, screenId, nextScreen, prevScreen }) {
  const TWEAK_DEFAULTS = window.__tweakDefaults || { mascot: true, accent: 'yellow' };
  const [tweaks, setTweaks] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('valendo_tweaks')) || TWEAK_DEFAULTS; }
    catch { return TWEAK_DEFAULTS; }
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-accent', tweaks.accent);
    localStorage.setItem('valendo_tweaks', JSON.stringify(tweaks));
  }, [tweaks]);

  const go = (url) => { if (url) window.location.href = url; };

  return (
    <>
      <Screen
        tweaks={tweaks}
        onSwitchScreen={() => go(nextScreen)}
        onBack={() => go(prevScreen || 'index.html')}
      />
      <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} />
      <PageNav currentId={screenId} />
    </>
  );
}

function PageNav({ currentId }) {
  const pages = [
    { id: 'login-a', label: 'Login · split', href: 'login-split.html' },
    { id: 'login-b', label: 'Login · card', href: 'login-card.html' },
    { id: 'lobby-a', label: 'Lobby · sidebar', href: 'lobby-sidebar.html' },
    { id: 'lobby-b', label: 'Lobby · bento', href: 'lobby-bento.html' },
  ];
  return (
    <div style={{
      position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
      zIndex: 500,
      background: '#fff',
      border: '2.5px solid #1A1A2E',
      borderRadius: 14,
      boxShadow: '3px 3px 0 #1A1A2E',
      padding: 6,
      display: 'flex', gap: 4,
      fontFamily: 'Nunito, system-ui, sans-serif',
    }}>
      <a href="index.html" style={{
        padding: '8px 12px', borderRadius: 10,
        fontWeight: 800, fontSize: 13,
        textDecoration: 'none',
        color: '#1A1A2E',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>← todas</a>
      {pages.map(p => (
        <a key={p.id} href={p.href} style={{
          padding: '8px 14px', borderRadius: 10,
          fontWeight: 800, fontSize: 13,
          textDecoration: 'none',
          background: currentId === p.id ? '#1B4FBE' : 'transparent',
          color: currentId === p.id ? '#fff' : '#1A1A2E',
        }}>{p.label}</a>
      ))}
    </div>
  );
}

window.PageShell = PageShell;
