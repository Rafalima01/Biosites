import { redirect } from 'next/navigation';
import { getPainel } from '@/lib/supabase/server';
import { escolherStudio, sair } from '../actions';
import { Menu } from '@/components/Menu';
import { Avisos } from '@/components/Avisos';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }) {
  const { user, studios, studio } = await getPainel();
  if (!user) redirect('/login');
  if (!studio) {
    return (
      <main className="login">
        <div className="card login__card">
          <h1 className="titulo">Acesso não liberado</h1>
          <p className="muted">O e-mail {user.email} ainda não está ligado a nenhum studio. Fale com a Vertex Labs para liberar.</p>
          <form action={sair}><button className="btn btn--bloco" type="submit">Sair</button></form>
        </div>
      </main>
    );
  }
  return (
    <div className="painel">
      <header className="topo">
        <div className="topo__marca">
          <span className="kicker">Painel</span>
          {studios.length > 1 ? (
            <form action={escolherStudio} className="topo__troca">
              <select name="slug" defaultValue={studio.slug} aria-label="Studio">
                {studios.map((s) => (
                  <option key={s.id} value={s.slug}>{s.name}</option>
                ))}
              </select>
              <button className="btn btn--mini" type="submit">Trocar</button>
            </form>
          ) : (
            <strong className="topo__nome">{studio.name}</strong>
          )}
        </div>
        <form action={sair}><button className="btn btn--mini btn--fantasma" type="submit" title={user.email}>Sair</button></form>
      </header>
      <Menu />
      <main className="conteudo">
        <Avisos studioId={studio.id} email={user.email} />
        {children}
      </main>
    </div>
  );
}
