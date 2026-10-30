'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const Icone = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.map((p) => <path key={p} d={p} />)}
  </svg>
);

const I = {
  dashboard: ['M4 13h6V4H4z', 'M14 20h6v-9h-6z', 'M4 20h6v-3H4z', 'M14 7h6V4h-6z'],
  agenda: ['M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
  relogio: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  bloqueio: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M5.6 5.6l12.8 12.8'],
  clientes: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M2.5 20a6.5 6.5 0 0 1 13 0', 'M16 3.5a4 4 0 0 1 0 7.5', 'M18.5 14a6.5 6.5 0 0 1 3 6'],
  seta: ['M9 6l6 6-6 6'],
  recolher: ['M15 6l-6 6 6 6', 'M20 4v16'],
};

/** Menu do painel. Agenda é um grupo (Calendário e Bloqueios). */
const ITENS = [
  { href: '/', label: 'Dashboard', icone: I.dashboard },
  {
    href: '/agenda',
    label: 'Agenda',
    icone: I.agenda,
    filhos: [
      { href: '/agenda', label: 'Calendário', icone: I.agenda, repete: true },
      { href: '/bloqueios', label: 'Bloqueios', icone: I.bloqueio },
    ],
  },
  { href: '/pedidos', label: 'Aguardando sinal', icone: I.relogio, contador: true },
  { href: '/clientes', label: 'Clientes', icone: I.clientes },
];

const fechar = () => document.documentElement.classList.remove('menu-aberto');
const ativoEm = (path, href) => (href === '/' ? path === '/' : path.startsWith(href));

function Link({ item, path, pendentes, sub = false }) {
  const ativo = ativoEm(path, item.href);
  return (
    <a
      href={item.href}
      className={`${sub ? 'menu__sub' : ''}${ativo ? ' is-ativo' : ''}`.trim() || undefined}
      aria-current={ativo ? 'page' : undefined}
      title={item.label}
      data-repete={item.repete ? '' : undefined}
      onClick={fechar}
    >
      <Icone d={item.icone} size={sub ? 18 : 20} />
      <span>{item.label}</span>
      {item.contador && pendentes ? <b className="menu__qtd" aria-label={`${pendentes} pendentes`}>{pendentes}</b> : null}
    </a>
  );
}

/** Abas do menu lateral. `pendentes`: quantos agendamentos aguardam o sinal (número ao lado). */
export function Menu({ pendentes = 0 }) {
  const path = usePathname();
  const naAgenda = path.startsWith('/agenda') || path.startsWith('/bloqueios');
  const [agendaAberta, setAgendaAberta] = useState(naAgenda);
  useEffect(() => {
    if (naAgenda) setAgendaAberta(true);
  }, [naAgenda]);
  // No celular o menu é uma gaveta: fecha ao trocar de página e com a tecla Esc.
  useEffect(fechar, [path]);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && fechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  return (
    <nav className="menu" aria-label="Painel">
      {ITENS.map((item) =>
        item.filhos ? (
          <div key={item.href} className={`menu__grupo${agendaAberta ? ' is-aberto' : ''}${naAgenda ? ' is-dentro' : ''}`}>
            <div className="menu__linha">
              <a href={item.href} className={naAgenda ? 'is-ativo-grupo' : undefined} title={item.label} onClick={fechar}>
                <Icone d={item.icone} />
                <span>{item.label}</span>
              </a>
              <button
                type="button"
                className="menu__abrir"
                aria-expanded={agendaAberta}
                aria-controls="submenu-agenda"
                aria-label={agendaAberta ? 'Fechar opções da agenda' : 'Abrir opções da agenda'}
                onClick={() => setAgendaAberta((v) => !v)}
              >
                <Icone d={I.seta} size={16} />
              </button>
            </div>
            <div className="menu__filhos" id="submenu-agenda">
              {item.filhos.map((f) => (
                <Link key={f.href + f.label} item={f} path={path} pendentes={pendentes} sub />
              ))}
            </div>
          </div>
        ) : (
          <Link key={item.href} item={item} path={path} pendentes={pendentes} />
        ),
      )}
    </nav>
  );
}

/** Computador: recolhe a barra lateral para só os ícones (lembra a escolha num cookie). */
export function BotaoRecolher({ recolhido: inicial }) {
  const [recolhido, setRecolhido] = useState(inicial);
  function alternar() {
    const novo = !recolhido;
    setRecolhido(novo);
    document.querySelector('.app')?.classList.toggle('app--recolhido', novo);
    document.cookie = `menu=${novo ? 'recolhido' : 'aberto'}; path=/; max-age=31536000; samesite=lax`;
  }
  return (
    <button type="button" className="lateral__recolher" onClick={alternar} aria-pressed={recolhido} aria-label={recolhido ? 'Abrir menu' : 'Recolher menu'} title={recolhido ? 'Abrir menu' : 'Recolher menu'}>
      <Icone d={I.recolher} size={18} />
    </button>
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
