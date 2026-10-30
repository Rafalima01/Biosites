'use client';
import { useState } from 'react';
import { UNIDADES, lerValor, nomeEmbalagem, temConteudo } from '@/lib/financas';

const reais = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** "Sai a R$ 32,00 por caixa · R$ 0,32 cada unidade" (só quando dá para calcular). */
function Calculo({ unidade, qtd, pago, conteudo }) {
  const q = lerValor(qtd);
  const v = lerValor(pago);
  if (!(q > 0) || !(v > 0)) return null;
  const porEmbalagem = v / q;
  const c = Math.round(lerValor(conteudo));
  return (
    <p className="calculo" aria-live="polite">
      Sai a <strong>{reais(porEmbalagem)}</strong> por {nomeEmbalagem(unidade, 1)}
      {temConteudo(unidade) && c >= 1 ? (
        <> · <strong>{reais(porEmbalagem / c)}</strong> cada unidade</>
      ) : null}
    </p>
  );
}

/** Cadastro de produto: embalagem, quantas comprou, valor total e a conta na hora. */
export function FormProduto({ action, voltar, categorias }) {
  const [unidade, setUnidade] = useState('un');
  const [qtd, setQtd] = useState('1');
  const [pago, setPago] = useState('');
  const [conteudo, setConteudo] = useState('');
  const plural = nomeEmbalagem(unidade, 2);

  return (
    <form action={action} className="form">
      <input type="hidden" name="voltar" value={voltar} />
      <label className="campo">Produto<input name="nome" required maxLength={80} placeholder="Ex.: luvas descartáveis" /></label>
      <label className="campo">Categoria (opcional)
        <input name="categoria" maxLength={40} list="categorias-produto" placeholder="Ex.: Unhas, Cílios, Descartáveis" />
        <datalist id="categorias-produto">
          {categorias.map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>
      <div className="form__linha">
        <label className="campo">Embalagem
          <select name="unidade" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
            {UNIDADES.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </label>
        <label className="campo">Quantas {plural}<input name="quantidade" inputMode="numeric" value={qtd} onChange={(e) => setQtd(e.target.value)} /></label>
      </div>
      {temConteudo(unidade) ? (
        <label className="campo">Quantas unidades vêm em cada {nomeEmbalagem(unidade, 1)} (opcional)
          <input name="conteudo" inputMode="numeric" value={conteudo} onChange={(e) => setConteudo(e.target.value)} placeholder="Ex.: 100 luvas" />
        </label>
      ) : null}
      <div className="form__linha">
        <label className="campo">Valor pago (total da compra)<input name="pago" inputMode="decimal" value={pago} onChange={(e) => setPago(e.target.value)} placeholder="0,00" /></label>
        <label className="campo">Avisar quando tiver<input name="minimo" inputMode="numeric" placeholder={`Ex.: 1 ${nomeEmbalagem(unidade, 1)}`} /></label>
      </div>
      <Calculo unidade={unidade} qtd={qtd} pago={pago} conteudo={conteudo} />
      <label className="check"><input type="checkbox" name="despesa" value="1" defaultChecked /> Lançar a compra nas despesas</label>
      <button className="btn btn--primario btn--bloco" type="submit">Cadastrar</button>
    </form>
  );
}

/** Repor: quantas embalagens chegaram e quanto pagou, com a conta na hora. */
export function FormRepor({ action, voltar, produto }) {
  const [qtd, setQtd] = useState('');
  const [pago, setPago] = useState('');
  const plural = nomeEmbalagem(produto.unit, 2);
  return (
    <form action={action} className="form">
      <input type="hidden" name="id" value={produto.id} />
      <input type="hidden" name="voltar" value={voltar} />
      <div className="form__linha">
        <label className="campo">Quantas {plural} chegaram<input name="quantidade" required inputMode="numeric" value={qtd} onChange={(e) => setQtd(e.target.value)} /></label>
        <label className="campo">Valor pago (total)<input name="pago" inputMode="decimal" value={pago} onChange={(e) => setPago(e.target.value)} placeholder="0,00" /></label>
      </div>
      <Calculo unidade={produto.unit} qtd={qtd} pago={pago} conteudo={produto.per_pack || ''} />
      <label className="check"><input type="checkbox" name="despesa" value="1" defaultChecked /> Lançar a compra nas despesas</label>
      <button className="btn btn--mini btn--primario" type="submit">Repor estoque</button>
    </form>
  );
}
