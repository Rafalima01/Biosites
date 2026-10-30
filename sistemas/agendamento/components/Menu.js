'use client';
import { usePathname } from 'next/navigation';

const ITENS = [
  ['/', 'Dashboard'],
  ['/agenda', 'Agenda'],
  ['/pedidos', 'Aguardando sinal'],
  ['/bloqueios', 'Bloqueios'],
  ['/clientes', 'Clientes'],
];

export function Menu() {
  const path = usePathname();
  return (
    <nav className="menu" aria-label="Painel">
      {ITENS.map(([href, label]) => {
        const ativo = href === '/' ? path === '/' : path.startsWith(href);
        return (
          <a key={href} href={href} className={ativo ? 'is-ativo' : ''} aria-current={ativo ? 'page' : undefined}>
            {label}
          </a>
        );
      })}
    </nav>
  );
}
