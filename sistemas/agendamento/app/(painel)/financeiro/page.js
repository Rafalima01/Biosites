import Link from 'next/link';
import { getPainel } from '@/lib/supabase/server';
import { MesNav } from '@/components/MesNav';
import { resumoFinanceiro } from '@/lib/financas';
import { hoje, mesDe, mesValido, noFuso, reais, somaMeses } from '@/lib/datas';

export const metadata = { title: 'Financeiro · Painel do studio' };

const pct = (n) => `${Math.round(n * 100)}%`;

// Resumo financeiro do mês: o que entrou (sinal ao confirmar, restante ao marcar "Realizado"),
// o que falta receber, despesas, lucro e o estoque.
export default async function FinanceiroPage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const tz = studio.timezone;
  const hojeDia = hoje(tz);
  const mes = mesValido(sp?.mes) ? sp.mes : mesDe(hojeDia);
  const ehAtual = mes === mesDe(hojeDia);
  const prox = somaMeses(mes, 1);

  const [{ data: ags }, { data: gastos }, { data: produtos }] = await Promise.all([
    supabase
      .from('appointments')
      .select('status, price, deposit, ends_at, confirmed_at')
      .eq('studio_id', studio.id)
      .gte('starts_at', noFuso(`${mes}-01`, '00:00', tz).toISOString())
      .lt('starts_at', noFuso(`${prox}-01`, '00:00', tz).toISOString()),
    supabase.from('expenses').select('category, amount').eq('studio_id', studio.id).gte('spent_on', `${mes}-01`).lt('spent_on', `${prox}-01`),
    supabase.from('products').select('quantity, min_quantity, unit_cost').eq('studio_id', studio.id),
  ]);

  const fin = resumoFinanceiro(ags || []);
  const lista = gastos || [];
  const despesas = lista.reduce((s, g) => s + Number(g.amount), 0);
  const lucro = fin.recebido - despesas;
  const margem = fin.recebido > 0 ? lucro / fin.recebido : null;

  const porCategoria = {};
  for (const g of lista) porCategoria[g.category] = (porCategoria[g.category] || 0) + Number(g.amount);
  const categorias = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(1, ...categorias.map(([, v]) => v));

  const itens = produtos || [];
  const valorEstoque = itens.reduce((s, p) => s + Number(p.quantity) * Number(p.unit_cost), 0);
  const acabando = itens.filter((p) => Number(p.quantity) <= Number(p.min_quantity)).length;

  return (
    <div className="fin">
      <MesNav base="/financeiro" mes={mes} ehAtual={ehAtual} kicker="Financeiro" className="fin__topo" />

      <div className="fin__resumo">
        <div className="kpi kpi--destaque">
          <span>Recebido no mês</span>
          <strong>{reais(fin.recebido)}</strong>
          <small>{reais(fin.aReceber)} a receber · previsto {reais(fin.previsto)}</small>
        </div>
        <Link className="kpi kpi--link" href={`/financeiro/despesas?mes=${mes}`}>
          <span>Despesas</span>
          <strong>{reais(despesas)}</strong>
          <small>ver e anotar →</small>
        </Link>
        <div className="kpi">
          <span>Lucro</span>
          <strong className={lucro < 0 ? 'desce' : 'sobe'}>{reais(lucro)}</strong>
          <small>{margem == null ? 'recebido − despesas' : `margem de ${pct(margem)}`}</small>
        </div>
      </div>

      <section className="card fin__entradas" aria-labelledby="e-titulo">
        <h2 className="subtitulo" id="e-titulo">Entradas do mês</h2>
        <dl className="fin__linhas">
          <div><dt>Sinais recebidos</dt><dd>{reais(fin.sinais)}</dd></div>
          <div><dt>Restante dos realizados ({fin.qtdRealizados})</dt><dd>{reais(fin.restantes)}</dd></div>
          <div className="fin__linha--total"><dt>Recebido</dt><dd>{reais(fin.recebido)}</dd></div>
          <div><dt>A receber dos confirmados ({fin.qtdConfirmados})</dt><dd>{reais(fin.aReceber)}</dd></div>
          {fin.retidos ? <div><dt>Sinais retidos (faltas e cancelamentos)</dt><dd>{reais(fin.retidos)}</dd></div> : null}
          <div><dt>Ticket médio dos realizados</dt><dd>{reais(fin.ticket)}</dd></div>
        </dl>
        <p className="muted fin__regra">
          Ao confirmar o sinal, entra o sinal. O restante entra quando você marca o atendimento como “Realizado”.
          {fin.qtdParaMarcar ? ` ${fin.qtdParaMarcar} ${fin.qtdParaMarcar === 1 ? 'atendimento já passou' : 'atendimentos já passaram'} e ainda não ${fin.qtdParaMarcar === 1 ? 'foi marcado' : 'foram marcados'}.` : ''}
        </p>
      </section>

      <section className="card fin__categorias" aria-labelledby="c-titulo">
        <div className="secao__topo">
          <h2 className="subtitulo" id="c-titulo">Despesas por categoria</h2>
          <Link className="link" href={`/financeiro/despesas?mes=${mes}`}>Anotar →</Link>
        </div>
        {categorias.length ? (
          <ul className="ranking">
            {categorias.map(([cat, valor]) => (
              <li key={cat} title={`${cat}: ${reais(valor)} (${pct(valor / despesas)} das despesas)`}>
                <div className="ranking__linha">
                  <span className="ranking__nome">{cat}</span>
                  <strong>{reais(valor)}</strong>
                </div>
                <i className="ranking__barra"><b style={{ width: `${(valor / maxCat) * 100}%` }} /></i>
                <small>{pct(valor / despesas)} das despesas</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="vazio">Nenhuma despesa anotada neste mês.</p>
        )}
      </section>

      <Link className="card fin__estoque" href="/financeiro/estoque">
        <h2 className="subtitulo">Produtos e estoque</h2>
        <div className="fin__estoque-numeros">
          <span><strong>{itens.length}</strong> produtos</span>
          <span><strong>{reais(valorEstoque)}</strong> em estoque</span>
          <span className={acabando ? 'fin__acabando' : undefined}><strong>{acabando}</strong> acabando</span>
        </div>
        <small className="link">Abrir estoque →</small>
      </Link>
    </div>
  );
}
