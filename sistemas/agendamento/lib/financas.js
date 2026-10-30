// Regras do financeiro, usadas pelo dashboard e pela aba Financeiro. Conta o dinheiro que entrou:
//
//   Sinal confirmado        → entra o SINAL (o restante fica "a receber").
//   Marcado como Realizado  → entra o RESTANTE (o procedimento completo está pago).
//   Faltou, ou cancelou depois do sinal pago → fica só o sinal (o studio não devolve).
//   Aguardando sinal (ou sinal vencido) → ainda não conta.

const num = (v) => Number(v || 0);

/** Quanto deste atendimento já entrou no caixa. */
export function valorRecebido(a) {
  if (a.status === 'done') return num(a.price);
  if (a.status === 'confirmed' || a.status === 'no_show') return num(a.deposit);
  if (a.status === 'cancelled' && a.confirmed_at) return num(a.deposit);
  return 0;
}

/**
 * Resumo financeiro de uma lista de atendimentos (de um período).
 * Precisa de: status, price, deposit, ends_at, confirmed_at.
 */
export function resumoFinanceiro(lista, agora = new Date()) {
  const r = { recebido: 0, aReceber: 0, retidos: 0, sinais: 0, restantes: 0, qtdRealizados: 0, qtdConfirmados: 0, qtdPorVir: 0, qtdParaMarcar: 0, valorRealizados: 0 };
  for (const a of lista) {
    r.recebido += valorRecebido(a);
    if (a.status === 'done') {
      r.qtdRealizados += 1;
      r.valorRealizados += num(a.price);
      r.sinais += num(a.deposit);
      r.restantes += num(a.price) - num(a.deposit);
    } else if (a.status === 'confirmed') {
      r.qtdConfirmados += 1;
      r.sinais += num(a.deposit);
      r.aReceber += num(a.price) - num(a.deposit);
      if (new Date(a.ends_at) <= agora) r.qtdParaMarcar += 1;
      else r.qtdPorVir += 1;
    } else if (a.status === 'no_show' || (a.status === 'cancelled' && a.confirmed_at)) {
      r.retidos += num(a.deposit);
      r.sinais += num(a.deposit);
    }
  }
  r.faturamento = r.recebido;
  r.previsto = r.recebido + r.aReceber;
  r.ticket = r.qtdRealizados ? r.valorRealizados / r.qtdRealizados : 0;
  return r;
}

/** "1.234,56", "1234.56" ou "R$ 80" → número (NaN se não for valor). */
export function lerValor(texto) {
  const t = String(texto || '').replace(/[^\d,.-]/g, '');
  if (!t) return NaN;
  return t.includes(',') ? Number(t.replace(/\./g, '').replace(',', '.')) : Number(t);
}

export const CATEGORIAS = ['Material', 'Aluguel', 'Contas', 'Marketing', 'Equipamentos', 'Taxas', 'Pessoal', 'Outros'];

/** Tipos de embalagem do estoque. Controle por embalagem: acabou uma, dá baixa de uma. */
export const UNIDADES = [
  { id: 'un', nome: 'Unidade', plural: 'unidades' },
  { id: 'cx', nome: 'Caixa', plural: 'caixas' },
  { id: 'pct', nome: 'Pacote', plural: 'pacotes' },
  { id: 'par', nome: 'Par', plural: 'pares' },
];

/** Caixa e pacote podem dizer quantas unidades vêm dentro (para saber quanto sai cada uma). */
export const temConteudo = (unit) => unit === 'cx' || unit === 'pct';

/** "2 caixas", "1 pacote", "3 unidades". */
export function nomeEmbalagem(unit, n) {
  const u = UNIDADES.find((x) => x.id === unit) || UNIDADES[0];
  return Number(n) === 1 ? u.nome.toLowerCase() : u.plural;
}
