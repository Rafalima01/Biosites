'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const Icone = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.map((p) => <path key={p} d={p} />)}
  </svg>
);

const ITENS = [
  ['/', 'Dashboard', ['M4 13h6V4H4z', 'M14 20h6v-9h-6z', 'M4 20h6v-3H4z', 'M14 7h6V4h-6z']],
  ['/agenda', 'Agenda', ['M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z', 'M4 10h16', 'M8 3v4', 'M16 3v4']],
  ['/pedidos', 'Aguardando sinal', ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2']],
  ['/bloqueios', 'Bloqueios', ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M5.6 5.6l12.8 12.8']],
  ['/clientes', 'Clientes', ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M2.5 20a6.5 6.5 0 0 1 13 0', 'M16 3.5a4 4 0 0 1 0 7.5', 'M18.5 14a6.5 6.5 0 0 1 3 6']],
];

const fechar = () => document.documentElement.classList.remove('menu-aberto');

/** Abas do menu lateral. `pendentes`: quantos agendamentos aguardam o sinal (número ao lado). */
export function Menu({ pendentes = 0 }) {
  const path = usePathname();
  // No celular o menu é uma gaveta: fecha ao trocar de página e com a tecla Esc.
  useEffect(fechar, [path]);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && fechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  return (
    <nav className="menu" aria-label="Painel">
      {ITENS.map(([href, label, icone]) => {
        const ativo = href === '/' ? path === '/' : path.startsWith(href);
        return (
          <a key={href} href={href} className={ativo ? 'is-ativo' : ''} aria-current={ativo ? 'page' : undefined} onClick={fechar}>
            <Icone d={icone} />
            <span>{label}</span>
            {href === '/pedidos' && pendentes ? <b className="menu__qtd" aria-label={`${pendentes} pendentes`}>{pendentes}</b> : null}
          </a>
        );
      })}
    </nav>
  );
}

/** Botão ☰ do topo (celular e tablet): abre a gaveta do menu. */
export function BotaoMenu() {
  return (
    <button
      type="button"
      className="menu-btn"
      aria-label="Abrir menu"
      aria-controls="menu-lateral"
      onClick={() => document.documentElement.classList.add('menu-aberto')}
    >
      <Icone d={['M4 7h16', 'M4 12h16', 'M4 17h16']} />
    </button>
  );
}

/** Fundo escurecido atrás da gaveta: tocar fora fecha. */
export function FundoMenu() {
  return <div className="menu-fundo" onClick={fechar} aria-hidden="true" />;
}

/** Botão × dentro da gaveta. */
export function FecharMenu() {
  return (
    <button type="button" className="lateral__fechar" aria-label="Fechar menu" onClick={fechar}>
      ×
    </button>
  );
}
