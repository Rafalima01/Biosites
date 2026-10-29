'use client';
import { useState } from 'react';

const Globo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
  </svg>
);

/** Botão no topo com o link do biosite da dona: abrir o site ou copiar o link para mandar. */
export function MeuSite({ url }) {
  const [aberto, setAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  if (!url) return null;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const campo = document.createElement('textarea');
      campo.value = url;
      document.body.appendChild(campo);
      campo.select();
      document.execCommand('copy');
      campo.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <>
      <button type="button" className="sino" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} aria-label="Meu site" title="Meu site">
        <Globo />
      </button>
      {aberto ? (
        <div className="card avisos" role="dialog" aria-label="Meu site">
          <button type="button" className="avisos__fechar" onClick={() => setAberto(false)} aria-label="Fechar">×</button>
          <p className="avisos__titulo">🌐 Meu site</p>
          <p className="site__link">{url.replace(/^https?:\/\//, '')}</p>
          <div className="site__botoes">
            <a className="btn btn--primario" href={url} target="_blank" rel="noopener">Abrir site</a>
            <button className="btn" type="button" onClick={copiar}>{copiado ? 'Link copiado ✓' : 'Copiar link'}</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
