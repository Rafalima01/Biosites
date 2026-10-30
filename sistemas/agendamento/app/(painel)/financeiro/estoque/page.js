import { getPainel } from '@/lib/supabase/server';
import { adicionarProduto, ajustarEstoque, apagarProduto, reporEstoque } from '../../../actions';
import { Retorno } from '@/components/Atendimento';
import { FormProduto, FormRepor } from '@/components/FormEstoque';
import { nomeEmbalagem, temConteudo } from '@/lib/financas';
import { reais } from '@/lib/datas';

export const metadata = { title: 'Estoque · Painel do studio' };

const qtdTexto = (n) => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

// Produtos e estoque: quanto tem de cada produto, quanto custou, o que está acabando.
export default async function EstoquePage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const voltar = '/financeiro/estoque';
  const { data, error: semTabela } = await supabase
    .from('products')
    .select('id, name, category, unit, quantity, min_quantity, unit_cost, per_pack')
    .eq('studio_id', studio.id)
    .order('name');
  const produtos = (data || []).map((p) => ({ ...p, acabando: Number(p.quantity) <= Number(p.min_quantity) }));
  // Os que estão acabando aparecem primeiro.
  produtos.sort((a, b) => Number(b.acabando) - Number(a.acabando));
  const valorEstoque = produtos.reduce((s, p) => s + Number(p.quantity) * Number(p.unit_cost), 0);
  const acabando = produtos.filter((p) => p.acabando).length;
  const categorias = [...new Set(produtos.map((p) => p.category).filter(Boolean))];

  return (
    <div className="fin fin--estoque">
      <div className="fin__topo">
        <p className="kicker">Financeiro</p>
        <h1 className="titulo">Produtos e estoque</h1>
      </div>
      <Retorno sp={sp} />
      {semTabela ? (
        <p className="aviso aviso--erro" role="alert">O estoque ainda não está instalado no banco. Rode o schema.sql atualizado no Supabase.</p>
      ) : null}

      <div className="fin__resumo">
        <div className="kpi kpi--destaque"><span>Valor em estoque</span><strong>{reais(valorEstoque)}</strong><small>pelo valor pago em cada produto</small></div>
        <div className="kpi"><span>Produtos</span><strong>{produtos.length}</strong><small>cadastrados</small></div>
        <div className="kpi"><span>Acabando</span><strong className={acabando ? 'desce' : undefined}>{acabando}</strong><small>no estoque mínimo ou abaixo</small></div>
      </div>

      <section className="card fin__nova" aria-labelledby="p-titulo">
        <h2 className="subtitulo" id="p-titulo">Cadastrar produto</h2>
        <FormProduto action={adicionarProduto} voltar={voltar} categorias={[...new Set(['Unhas', 'Sobrancelhas', 'Cílios', 'Descartáveis', ...categorias])]} />
      </section>

      <section className="fin__lista fin__lista--grade" aria-labelledby="e-titulo">
        <h2 className="subtitulo" id="e-titulo">Estoque</h2>
        {produtos.length ? (
          <ul className="lista lista--compacta">
            {produtos.map((p) => (
              <li key={p.id} className={`produto${p.acabando ? ' produto--acabando' : ''}`}>
                <div className="produto__topo">
                  <span className="produto__nome">
                    <strong>{p.name}</strong>
                    <small>
                      {p.category ? `${p.category} · ` : ''}
                      {Number(p.unit_cost) ? `${reais(p.unit_cost)} por ${nomeEmbalagem(p.unit, 1)}` : 'sem valor de compra'}
                      {Number(p.unit_cost) && temConteudo(p.unit) && p.per_pack ? ` · ${reais(Number(p.unit_cost) / p.per_pack)} cada unidade (${p.per_pack} por ${nomeEmbalagem(p.unit, 1)})` : ''}
                    </small>
                  </span>
                  {p.acabando ? <span className="selo selo--pendente">Acabando</span> : null}
                </div>
                <div className="produto__qtd">
                  <form action={ajustarEstoque}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="delta" value="-1" />
                    <input type="hidden" name="voltar" value={voltar} />
                    <button className="produto__btn" type="submit" aria-label={`Dar baixa de 1 ${nomeEmbalagem(p.unit, 1)} em ${p.name}`} disabled={Number(p.quantity) <= 0}>−</button>
                  </form>
                  <span className="produto__num"><strong>{qtdTexto(p.quantity)}</strong> {nomeEmbalagem(p.unit, p.quantity)}</span>
                  <form action={ajustarEstoque}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="delta" value="1" />
                    <input type="hidden" name="voltar" value={voltar} />
                    <button className="produto__btn" type="submit" aria-label={`Somar 1 ${nomeEmbalagem(p.unit, 1)} em ${p.name}`}>+</button>
                  </form>
                  <small className="produto__min">avisar com {qtdTexto(p.min_quantity)}</small>
                </div>
                <details className="produto__repor">
                  <summary>Repor · apagar</summary>
                  <FormRepor action={reporEstoque} voltar={voltar} produto={p} />
                  <form action={apagarProduto}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="voltar" value={voltar} />
                    <button className="btn btn--mini btn--fantasma" type="submit">Apagar produto</button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="vazio">Cadastre os produtos que você usa para saber quanto tem e o que está acabando.</p>
        )}
      </section>
    </div>
  );
}
