import { getPainel } from '@/lib/supabase/server';
import { adicionarProduto, ajustarEstoque, apagarProduto, reporEstoque } from '../../../actions';
import { Retorno } from '@/components/Atendimento';
import { UNIDADES } from '@/lib/financas';
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
    .select('id, name, category, unit, quantity, min_quantity, unit_cost')
    .eq('studio_id', studio.id)
    .order('name');
  const produtos = (data || []).map((p) => ({ ...p, acabando: Number(p.quantity) <= Number(p.min_quantity) }));
  // Os que estão acabando aparecem primeiro.
  produtos.sort((a, b) => Number(b.acabando) - Number(a.acabando));
  const valorEstoque = produtos.reduce((s, p) => s + Number(p.quantity) * Number(p.unit_cost), 0);
  const acabando = produtos.filter((p) => p.acabando).length;
  const categorias = [...new Set(produtos.map((p) => p.category).filter(Boolean))];

  return (
    <div className="fin">
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
        <form action={adicionarProduto} className="form">
          <input type="hidden" name="voltar" value={voltar} />
          <label className="campo">Produto<input name="nome" required maxLength={80} placeholder="Ex.: gel construtor nude" /></label>
          <label className="campo">Categoria (opcional)
            <input name="categoria" maxLength={40} list="categorias-produto" placeholder="Ex.: Unhas, Cílios, Descartáveis" />
            <datalist id="categorias-produto">
              {[...new Set(['Unhas', 'Sobrancelhas', 'Cílios', 'Descartáveis', ...categorias])].map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>
          <div className="form__linha">
            <label className="campo">Quantidade<input name="quantidade" inputMode="decimal" defaultValue="1" /></label>
            <label className="campo">Unidade
              <select name="unidade" defaultValue="un">
                {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </label>
          </div>
          <div className="form__linha">
            <label className="campo">Valor pago (total)<input name="pago" inputMode="decimal" placeholder="0,00" /></label>
            <label className="campo">Avisar quando tiver<input name="minimo" inputMode="decimal" placeholder="Ex.: 2" /></label>
          </div>
          <label className="check"><input type="checkbox" name="despesa" value="1" defaultChecked /> Lançar a compra nas despesas</label>
          <button className="btn btn--primario btn--bloco" type="submit">Cadastrar</button>
        </form>
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
                      {Number(p.unit_cost) ? `${reais(p.unit_cost)} por ${p.unit}` : 'sem valor de compra'}
                    </small>
                  </span>
                  {p.acabando ? <span className="selo selo--pendente">Acabando</span> : null}
                </div>
                <div className="produto__qtd">
                  <form action={ajustarEstoque}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="delta" value="-1" />
                    <input type="hidden" name="voltar" value={voltar} />
                    <button className="produto__btn" type="submit" aria-label={`Dar baixa de 1 ${p.unit} em ${p.name}`} disabled={Number(p.quantity) <= 0}>−</button>
                  </form>
                  <span className="produto__num"><strong>{qtdTexto(p.quantity)}</strong> {p.unit}</span>
                  <form action={ajustarEstoque}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="delta" value="1" />
                    <input type="hidden" name="voltar" value={voltar} />
                    <button className="produto__btn" type="submit" aria-label={`Somar 1 ${p.unit} em ${p.name}`}>+</button>
                  </form>
                  <small className="produto__min">mínimo {qtdTexto(p.min_quantity)}</small>
                </div>
                <details className="produto__repor">
                  <summary>Repor · apagar</summary>
                  <form action={reporEstoque} className="form">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="voltar" value={voltar} />
                    <div className="form__linha">
                      <label className="campo">Quantos chegaram ({p.unit})<input name="quantidade" required inputMode="decimal" /></label>
                      <label className="campo">Valor pago (total)<input name="pago" inputMode="decimal" placeholder="0,00" /></label>
                    </div>
                    <label className="check"><input type="checkbox" name="despesa" value="1" defaultChecked /> Lançar a compra nas despesas</label>
                    <button className="btn btn--mini btn--primario" type="submit">Repor estoque</button>
                  </form>
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
