'use client';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/Icon';

const ITEMS = [
  ['/admin', 'Visão geral', 'chart'],
  ['/admin/reservas', 'Reservas', 'calendar'],
  ['/admin/agenda', 'Agenda', 'clock'],
  ['/admin/casas', 'Casas', 'home'],
  ['/admin/promocoes', 'Promoções', 'percent'],
  ['/admin/pacotes', 'Pacotes', 'box'],
  ['/admin/configuracoes', 'Configurações', 'settings'],
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin__nav" aria-label="Painel">
      {ITEMS.map(([href, label, icon]) => {
        const active = href === '/admin' ? path === href : path.startsWith(href);
        return (
          <a key={href} href={href} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined}>
            <Icon name={icon} size={20} />
            <span>{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
