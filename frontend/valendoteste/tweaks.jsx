// Valendo — Tweaks panel (mascot on/off, accent color)
function TweaksPanel({ tweaks, setTweaks }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const update = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  };

  return (
    <div className={`tweaks-panel ${open ? 'is-open' : ''}`}>
      <h4>Tweaks</h4>
      <div className="tweak-row">
        <span className="tweak-label">Mascote Valdo</span>
        <div
          className={`switch ${tweaks.mascot ? 'on' : ''}`}
          onClick={() => update({ mascot: !tweaks.mascot })}
          role="button"
          aria-label="toggle mascot"
        />
      </div>
      <div className="tweak-row">
        <span className="tweak-label">Cor de destaque</span>
        <div className="seg">
          <button
            className={tweaks.accent === 'yellow' ? 'active' : ''}
            onClick={() => update({ accent: 'yellow' })}
          >Amarelo</button>
          <button
            className={tweaks.accent === 'orange' ? 'active' : ''}
            onClick={() => update({ accent: 'orange' })}
          >Laranja</button>
        </div>
      </div>
      <p style={{
        margin: '14px 0 0', fontFamily: 'Caveat, cursive',
        fontSize: 17, color: 'var(--muted)', lineHeight: 1.2
      }}>
        ↳ feche o painel no toolbar pra ver tudo limpo
      </p>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
