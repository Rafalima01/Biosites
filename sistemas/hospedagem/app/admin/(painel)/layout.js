import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/supabase/server';
import { loadSettings } from '@/lib/settings';
import { signOut } from '../actions';
import { Icon, LogoMark } from '@/components/Icon';
import { AdminNav } from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Painel do anfitrião', robots: { index: false } };

export default async function PanelLayout({ children }) {
  const { supabase, user, isAdmin } = await getAdmin();
  if (!user) redirect('/admin/login');
  if (!isAdmin) {
    return (
      <main className="login">
        <div className="login__card">
          <h1 className="section__title">Acesso não liberado</h1>
          <p className="section__lead">O e-mail {user.email} ainda não está cadastrado como anfitrião. Peça para incluir na tabela de administradores.</p>
          <form action={signOut}><button className="btn btn--ghost btn--block" type="submit"><Icon name="logout" size={18} />Sair</button></form>
        </div>
      </main>
    );
  }
  const settings = await loadSettings(supabase);
  return (
    <div className="admin">
      <aside className="admin__side">
        <a className="admin__brand" href="/admin">
          <LogoMark size={32} />
          <span><strong>{settings.brand.name}</strong><small>Painel</small></span>
        </a>
        <AdminNav />
        <div className="admin__account">
          <a className="admin__site" href="/" target="_blank" rel="noopener noreferrer"><Icon name="eye" size={18} />Ver site</a>
          <form action={signOut}><button type="submit" className="admin__logout" title={user.email}><Icon name="logout" size={18} />Sair</button></form>
        </div>
      </aside>
      <main className="admin__main">{children}</main>
    </div>
  );
}
