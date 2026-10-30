'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  financeiro: ['M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M6.5 9v.01', 'M17.5 15v.01'],
  despesas: ['M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21z', 'M10 8h4', 'M10 12h4'],
  estoque: ['M3 8l9-5 9 5v8l-9 5-9-5z', 'M3 8l9 5 9-5', 'M12 13v8'],
  estrela: ['M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z'],
  bolo: ['M4 21h16', 'M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7', 'M5 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0', 'M12 12V8', 'M12 5.5c.8-.6.8-1.6 0-2.5-.8.9-.8 1.9 0 2.5z'],
  seta: ['M9 6l6 6-6 6'],
  recolher: ['M15 6l-6 6 6 6', 'M20 4v16'],
};

/** Menu do painel. Agenda e Financeiro são grupos com subopções. */
const ITENS = [
  { href: '/', label: 'Dashboard', icone: I.dashboard },
  {
    id: 'agenda',
    href: '/agenda',
    label: 'Agenda',
    icone: I.agenda,
    dentro: ['/agenda', '/bloqueios'],
    filhos: [
      { href: '/agenda', label: 'Calendário', icone: I.agenda, repete: true },
      { href: '/bloqueios', label: 'Bloqueios', icone: I.bloqueio },
    ],
  },
  { href: '/pedidos', label: 'Aguardando sinal', icone: I.relogio, contador: true },
  {
    id: 'clientes',
    href: '/clientes',
    label: 'Clientes',
    icone: I.clientes,
    dentro: ['/clientes'],
    filhos: [
      { href: '/clientes', label: 'Todas', icone: I.clientes, repete: true, exato: true },
      { href: '/clientes/melhores', label: 'Melhores clientes', icone: I.estrela },
      { href: '/clientes/aniversarios', label: 'Aniversariantes', icone: I.bolo },
    ],
  },
  {
    id: 'financeiro',
    href: '/financeiro',
    label: 'Financeiro',
    icone: I.financeiro,
    dentro: ['/financeiro'],
    filhos: [
      { href: '/financeiro', label: 'Resumo', icone: I.financeiro, repete: true, exato: true },
      { href: '/financeiro/despesas', label: 'Despesas', icone: I.despesas },
      { href: '/financeiro/estoque', label: 'Produtos e estoque', icone: I.estoque },
    ],
  },
];

const fechar = () => document.documentElement.classList.remove('menu-aberto');
const ativoEm = (path, item) => (item.href === '/' || item.exato ? path === item.href : path.startsWith(item.href));
const dentroDe = (path, grupo) => grupo.dentro.some((h) => path.startsWith(h));

function ItemMenu({ item, path, pendentes, sub = false }) {
  const ativo = ativoEm(path, item);
  return (
    <Link
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
    </Link>
  );
}

/** Grupo com subopções: abre sozinho quando a página aberta é dele; a seta abre e fecha. */
function Grupo({ grupo, path, pendentes }) {
  const dentro = dentroDe(path, grupo);
  const [aberto, setAberto] = useState(dentro);
  useEffect(() => {
    if (dentro) setAberto(true);
  }, [dentro]);
  return (
    <div className={`menu__grupo${aberto ? ' is-aberto' : ''}`}>
      <div className="menu__linha">
        <Link href={grupo.href} className={dentro ? 'is-ativo-grupo' : undefined} title={grupo.label} onClick={fechar}>
          <Icone d={grupo.icone} />
          <span>{grupo.label}</span>
        </Link>
        <button
          type="button"
          className="menu__abrir"
          aria-expanded={aberto}
          aria-controls={`submenu-${grupo.id}`}
          aria-label={`${aberto ? 'Fechar' : 'Abrir'} opções de ${grupo.label}`}
          onClick={() => setAberto((v) => !v)}
        >
          <Icone d={I.seta} size={16} />
        </button>
      </div>
      <div className="menu__filhos" id={`submenu-${grupo.id}`}>
        {grupo.filhos.map((f) => (
          <ItemMenu key={f.href + f.label} item={f} path={path} pendentes={pendentes} sub />
        ))}
      </div>
    </div>
  );
}

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
      {ITENS.map((item) =>
        item.filhos ? (
          <Grupo key={item.id} grupo={item} path={path} pendentes={pendentes} />
        ) : (
          <ItemMenu key={item.href} item={item} path={path} pendentes={pendentes} />
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
