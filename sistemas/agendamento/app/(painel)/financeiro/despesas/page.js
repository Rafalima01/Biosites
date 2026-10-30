import { getPainel } from '@/lib/supabase/server';
import { adicionarDespesa, apagarDespesa } from '../../../actions';
import { Retorno } from '@/components/Atendimento';
import { MesNav } from '@/components/MesNav';
import { CATEGORIAS } from '@/lib/financas';
import { hoje, mesDe, mesValido, nomeMes, reais, somaMeses } from '@/lib/datas';

export const metadata = { title: 'Despesas · Painel do studio' };

const diaMes = (d) => `${d.slice(8)}/${d.slice(5, 7)}`;

// Despesas do mês: anotar (material, aluguel, contas...) e a lista com o total.
export default async function DespesasPage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const hojeDia = hoje(studio.timezone);
  const mes = mesValido(sp?.mes) ? sp.mes : mesDe(hojeDia);
  const ehAtual = mes === mesDe(hojeDia);
  const voltar = `/financeiro/despesas?mes=${mes}`;

  const { data: gastos, error: semTabela } = await supabase
    .from('expenses')
    .select('id, spent_on, description, category, amount')
    .eq('studio_id', studio.id)
    .gte('spent_on', `${mes}-01`)
    .lt('spent_on', `${somaMeses(mes, 1)}-01`)
    .order('spent_on', { ascending: false })
    .order('created_at', { ascending: false });
  const lista = gastos || [];
  const total = lista.reduce((s, g) => s + Number(g.amount), 0);
  // Data padrão: hoje, se o mês aberto for o atual; senão, o dia 1 do mês aberto.
  const diaPadrao = ehAtual ? hojeDia : `${mes}-01`;

  return (
    <div className="fin">
      <MesNav base="/financeiro/despesas" mes={mes} ehAtual={ehAtual} kicker="Despesas" className="fin__topo" />
      <Retorno sp={sp} />
      {semTabela ? (
        <p className="aviso aviso--erro" role="alert">As despesas ainda não estão instaladas no banco. Rode o schema.sql atualizado no Supabase.</p>
      ) : null}

      <section className="card fin__nova" aria-labelledby="n-titulo">
        <h2 className="subtitulo" id="n-titulo">Anotar despesa</h2>
        <form action={adicionarDespesa} className="form">
          <input type="hidden" name="voltar" value={voltar} />
          <label className="campo">Com o que foi?<input name="descricao" required maxLength={120} placeholder="Ex.: gel e tips, aluguel, luz" /></label>
          <div className="form__linha">
            <label className="campo">Valor (R$)<input name="valor" required inputMode="decimal" placeholder="0,00" /></label>
            <label className="campo">Data<input type="date" name="dia" required defaultValue={diaPadrao} /></label>
          </div>
          <label className="campo">Categoria
            <select name="categoria" defaultValue="Material">
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <button className="btn btn--primario btn--bloco" type="submit">Anotar despesa</button>
        </form>
        <p className="muted fin__regra">Compras de produto feitas pelo estoque (botão "Repor") já entram aqui sozinhas.</p>
      </section>

      <section className="fin__lista" aria-labelledby="l-titulo">
        <div className="secao__topo">
          <h2 className="subtitulo" id="l-titulo">Despesas de {nomeMes(mes).toLowerCase()}</h2>
          <strong className="fin__total">{reais(total)}</strong>
        </div>
        {lista.length ? (
          <ul className="lista lista--compacta">
            {lista.map((g) => (
              <li key={g.id} className="despesa">
                <span className="despesa__dia">{diaMes(g.spent_on)}</span>
                <span className="despesa__corpo">
                  <strong>{g.description}</strong>
                  <small>{g.category}</small>
                </span>
                <strong className="despesa__valor">{reais(g.amount)}</strong>
                <form action={apagarDespesa}>
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="voltar" value={voltar} />
                  <button className="despesa__apagar" type="submit" aria-label={`Apagar ${g.description}`} title="Apagar">×</button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="vazio">Anote aqui o que você gasta com o studio para ver o lucro de verdade.</p>
        )}
      </section>
    </div>
  );
}
