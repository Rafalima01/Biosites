import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPainel } from '@/lib/supabase/server';
import { escolherStudio, sair } from '../actions';
import { BotaoMenu, BotaoRecolher, FecharMenu, FundoMenu, Menu } from '@/components/Menu';
import { Avisos } from '@/components/Avisos';
import { MeuSite } from '@/components/MeuSite';
import { sinalDoStudio } from '@/lib/configuracoes';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }) {
  const { supabase, user, studios, studio } = await getPainel();
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
  // Número ao lado de "Aguardando sinal" no menu.
  const { count: pendentes } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('studio_id', studio.id)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString());

  // Menu recolhido (só ícones) no computador: a escolha fica num cookie.
  const recolhido = (await cookies()).get('menu')?.value === 'recolhido';
  const iniciais = studio.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  const marca =
    studios.length > 1 ? (
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
    );

  return (
    <div className={`app${recolhido ? ' app--recolhido' : ''}`}>
      {/* Menu lateral: fixo no computador, gaveta que desliza da esquerda no celular */}
      <aside className="lateral" id="menu-lateral" aria-label="Menu do painel">
        <div className="lateral__marca">
          <span className="lateral__monograma" aria-hidden="true" title={studio.name}>{iniciais}</span>
          <div className="lateral__nome">
            <span className="kicker">Painel</span>
            {marca}
          </div>
          <FecharMenu />
          <BotaoRecolher recolhido={recolhido} />
        </div>
        <Menu pendentes={pendentes || 0} exigeSinal={sinalDoStudio(studio).exige} />
        <div className="lateral__pe">
          <span className="lateral__email" title={user.email}>{user.email}</span>
          <form action={sair}>
            <button className="btn btn--mini btn--fantasma btn--bloco lateral__sair" type="submit" title="Sair">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5" /><path d="M5 12h11" /></svg>
              <span>Sair</span>
            </button>
          </form>
        </div>
      </aside>
      <FundoMenu />

      <div className="painel">
        <header className="topo">
          <BotaoMenu />
          <div className="topo__marca">
            <span className="kicker">Painel</span>
            <strong className="topo__nome">{studio.name}</strong>
          </div>
          <div className="topo__acoes">
            <MeuSite url={studio.site_url} />
            <Avisos studioId={studio.id} email={user.email} />
          </div>
        </header>
        <main className="conteudo">{children}</main>
      </div>
    </div>
  );
}
