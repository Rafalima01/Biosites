import Link from 'next/link';
import { getPainel } from '@/lib/supabase/server';
import { aniversario, carregarClientes } from '@/lib/clientes';
import { diaCurto, reais, whatsapp } from '@/lib/datas';

export const metadata = { title: 'Melhores clientes · Painel do studio' };

const SUMIDA = 60; // dias sem vir para aparecer "sumida"

// Melhores clientes: quem mais gastou (ou mais veio), com frequência e quem está sumida.
export default async function MelhoresPage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const tz = studio.timezone;
  const porVisitas = sp?.ordem === 'visitas';
  const todas = (await carregarClientes(supabase, studio.id)).filter((c) => c.atendimentos > 0);
  const ranking = [...todas]
    .sort((a, b) => (porVisitas ? b.atendimentos - a.atendimentos || b.gasto - a.gasto : b.gasto - a.gasto || b.atendimentos - a.atendimentos))
    .slice(0, 20);
  const totalTop = ranking.reduce((s, c) => s + c.gasto, 0);
  const totalGeral = todas.reduce((s, c) => s + c.gasto, 0);
  const max = Math.max(1, ...ranking.map((c) => (porVisitas ? c.atendimentos : c.gasto)));
  const top5 = ranking.slice(0, 5).reduce((s, c) => s + c.gasto, 0);

  return (
    <div className="fin">
      <div className="fin__topo">
        <p className="kicker">Clientes</p>
        <h1 className="titulo">Melhores clientes</h1>
      </div>

      <div className="fin__resumo">
        <div className="kpi kpi--destaque">
          <span>As 5 que mais gastaram</span>
          <strong>{reais(top5)}</strong>
          <small>{totalGeral ? `${Math.round((top5 / totalGeral) * 100)}% de tudo que as clientes já gastaram` : 'nenhum atendimento realizado ainda'}</small>
        </div>
        <div className="kpi"><span>Clientes que já vieram</span><strong>{todas.length}</strong><small>com atendimento realizado</small></div>
        <div className="kpi"><span>Sumidas</span><strong className={todas.some((c) => c.diasSemVir > SUMIDA) ? 'desce' : undefined}>{todas.filter((c) => c.diasSemVir > SUMIDA).length}</strong><small>há mais de {SUMIDA} dias sem vir</small></div>
      </div>

      <div className="abas" role="tablist" aria-label="Ordenar">
        <Link href="/clientes/melhores" className={porVisitas ? '' : 'is-ativo'} aria-current={porVisitas ? undefined : 'page'}>Quem mais gastou</Link>
        <Link href="/clientes/melhores?ordem=visitas" className={porVisitas ? 'is-ativo' : ''} aria-current={porVisitas ? 'page' : undefined}>Quem mais veio</Link>
      </div>

      {ranking.length ? (
        <ol className="melhores">
          {ranking.map((c, i) => {
            const sumida = c.diasSemVir > SUMIDA;
            return (
              <li key={c.id} className="melhor">
                <span className={`melhor__pos${i < 3 ? ` melhor__pos--${i + 1}` : ''}`}>{i + 1}º</span>
                <div className="melhor__corpo">
                  <div className="melhor__topo">
                    <strong className="melhor__nome">{c.name}</strong>
                    <strong className="melhor__valor">{porVisitas ? `${c.atendimentos} visitas` : reais(c.gasto)}</strong>
                  </div>
                  <i className="ranking__barra"><b style={{ width: `${((porVisitas ? c.atendimentos : c.gasto) / max) * 100}%` }} /></i>
                  <p className="cliente__info">
                    <span>{porVisitas ? reais(c.gasto) : `${c.atendimentos} ${c.atendimentos === 1 ? 'visita' : 'visitas'}`}</span>
                    <span>ticket {reais(c.ticket)}</span>
                    {c.frequencia ? <span>volta a cada ~{c.frequencia} dias</span> : null}
                    {c.favorito ? <span>gosta de {c.favorito}</span> : null}
                    {c.ultimo ? <span className={sumida ? 'cliente__falta' : undefined}>{sumida ? `sumida há ${c.diasSemVir} dias` : `última vez ${diaCurto(c.ultimo.starts_at, tz)}`}</span> : null}
                    {aniversario(c) ? <span className="cliente__niver">🎂 {aniversario(c)}</span> : null}
                  </p>
                </div>
                <a
                  className="btn btn--mini"
                  href={whatsapp(c.phone, sumida ? `Oi, ${c.name.split(' ')[0]}! Que saudade 💜 Aqui é do ${studio.name}. Bora marcar seu horário?` : `Olá, ${c.name.split(' ')[0]}!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="vazio">As melhores clientes aparecem aqui depois dos primeiros atendimentos marcados como “Realizado”.</p>
      )}
      {ranking.length && totalGeral ? (
        <p className="muted">Estas {ranking.length} clientes somam {reais(totalTop)} ({Math.round((totalTop / totalGeral) * 100)}% do total). Conta só atendimentos marcados como “Realizado”.</p>
      ) : null}
    </div>
  );
}
