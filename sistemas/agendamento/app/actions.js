'use server';
// Ações do painel. O banco confere de novo se a pessoa é do studio (RLS e funções).
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPainel, supabaseServer } from '@/lib/supabase/server';
import { diaCurto, diaDe, hoje as hojeNoFuso, hora, noFuso, valido } from '@/lib/datas';
import { CATEGORIAS, UNIDADES, lerValor, temConteudo } from '@/lib/financas';

const txt = (fd, k) => String(fd.get(k) ?? '').trim();

/** Volta para a página de origem com uma mensagem (sucesso ou erro). */
function voltar(fd, chave, msg) {
  const destino = txt(fd, 'voltar') || '/';
  const url = new URL(destino, 'http://x');
  url.searchParams.set(chave, msg);
  redirect(url.pathname + url.search);
}

function amigavel(error) {
  const m = String(error?.message || error || '');
  if (/Acesso negado/.test(m)) return 'Você não tem acesso a este studio.';
  if (/já foi ocupado/.test(m)) return 'Esse horário já foi ocupado por outro agendamento.';
  if (/violates check constraint/.test(m)) return 'Confira as datas e horários.';
  return m || 'Não foi possível salvar.';
}

async function studioAtual() {
  const ctx = await getPainel();
  if (!ctx.user || !ctx.studio) throw new Error('Acesso negado');
  return ctx;
}

export async function sair() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function escolherStudio(fd) {
  const store = await cookies();
  store.set('studio', txt(fd, 'slug'), { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  redirect('/');
}

const MENSAGENS = {
  confirmed: 'Sinal confirmado.',
  done: 'Atendimento marcado como realizado.',
  no_show: 'Marcado como falta.',
  cancelled: 'Agendamento cancelado.',
  pending: 'Agendamento reativado por 24 horas.',
};

export async function mudarStatus(fd) {
  const { supabase, studio } = await studioAtual();
  const status = txt(fd, 'status');
  const id = txt(fd, 'id');
  const { error } = await supabase.rpc('set_appointment_status', { p_id: id, p_status: status });
  revalidatePath('/', 'layout');
  if (error) voltar(fd, 'erro', amigavel(error));
  // Confirmou o sinal fora da agenda (ex.: em "Aguardando sinal"): leva para o dia do atendimento.
  if (status === 'confirmed' && !txt(fd, 'voltar').startsWith('/agenda')) {
    const { data } = await supabase.from('appointments').select('starts_at').eq('id', id).single();
    if (data) {
      const dia = diaDe(data.starts_at, studio.timezone);
      redirect(`/agenda?dia=${dia}&ok=${encodeURIComponent(`Sinal confirmado. O atendimento está na agenda de ${diaCurto(data.starts_at, studio.timezone)} às ${hora(data.starts_at, studio.timezone)}.`)}`);
    }
  }
  voltar(fd, 'ok', MENSAGENS[status] || 'Salvo.');
}

export async function encaixar(fd) {
  const { supabase, studio } = await studioAtual();
  const dia = txt(fd, 'dia');
  const h = txt(fd, 'hora');
  if (!dia || !h) voltar(fd, 'erro', 'Informe o dia e o horário.');
  const { data, error } = await supabase.rpc('add_appointment', {
    p_studio: studio.id,
    p_service: txt(fd, 'servico'),
    p_starts: noFuso(dia, h, studio.timezone).toISOString(),
    p_name: txt(fd, 'nome'),
    p_phone: txt(fd, 'telefone'),
    p_notes: txt(fd, 'obs'),
  });
  revalidatePath('/', 'layout');
  if (error) voltar(fd, 'erro', amigavel(error));
  if (!data?.ok) voltar(fd, 'erro', data?.reason || 'Não foi possível encaixar.');
  voltar(fd, 'ok', 'Atendimento encaixado na agenda.');
}

export async function bloquear(fd) {
  const { supabase, studio } = await studioAtual();
  const dia = txt(fd, 'dia');
  const ate = txt(fd, 'ate_dia') || dia;
  const inicio = txt(fd, 'inteiro') ? '00:00' : txt(fd, 'de');
  const fim = txt(fd, 'inteiro') ? '23:59' : txt(fd, 'ate');
  if (!dia || !inicio || !fim) voltar(fd, 'erro', 'Informe o dia e o horário do bloqueio.');
  const starts = noFuso(dia, inicio, studio.timezone);
  const ends = noFuso(ate, fim, studio.timezone);
  if (ends <= starts) voltar(fd, 'erro', 'O fim do bloqueio precisa ser depois do início.');
  const { error } = await supabase.from('blocks').insert({ studio_id: studio.id, starts_at: starts.toISOString(), ends_at: ends.toISOString(), reason: txt(fd, 'motivo') });
  revalidatePath('/', 'layout');
  if (error) voltar(fd, 'erro', amigavel(error));
  voltar(fd, 'ok', 'Horário bloqueado.');
}

export async function desbloquear(fd) {
  const { supabase } = await studioAtual();
  const { error } = await supabase.from('blocks').delete().eq('id', txt(fd, 'id'));
  revalidatePath('/', 'layout');
  if (error) voltar(fd, 'erro', amigavel(error));
  voltar(fd, 'ok', 'Bloqueio removido.');
}

export async function adicionarDespesa(fd) {
  const { supabase, studio } = await studioAtual();
  const dia = txt(fd, 'dia');
  const valor = lerValor(txt(fd, 'valor'));
  const categoria = CATEGORIAS.includes(txt(fd, 'categoria')) ? txt(fd, 'categoria') : 'Outros';
  if (!valido(dia)) voltar(fd, 'erro', 'Informe a data da despesa.');
  if (!(valor > 0)) voltar(fd, 'erro', 'Informe o valor da despesa (ex.: 120,50).');
  if (!txt(fd, 'descricao')) voltar(fd, 'erro', 'Escreva com o que foi a despesa.');
  const { error } = await supabase.from('expenses').insert({
    studio_id: studio.id,
    spent_on: dia,
    description: txt(fd, 'descricao').slice(0, 120),
    category: categoria,
    amount: Math.round(valor * 100) / 100,
  });
  revalidatePath('/', 'layout');
  if (error) voltar(fd, 'erro', amigavel(error));
  voltar(fd, 'ok', 'Despesa anotada.');
}

export async function apagarDespesa(fd) {
  const { supabase } = await studioAtual();
  const { error } = await supabase.from('expenses').delete().eq('id', txt(fd, 'id'));
  revalidatePath('/', 'layout');
  if (error) voltar(fd, 'erro', amigavel(error));
  voltar(fd, 'ok', 'Despesa apagada.');
}

export async function adicionarProduto(fd) {
  const { supabase, studio } = await studioAtual();
  const quantidade = lerValor(txt(fd, 'quantidade')) || 0;
  const pago = lerValor(txt(fd, 'pago')) || 0;
  if (!txt(fd, 'nome')) voltar(fd, 'erro', 'Escreva o nome do produto.');
  if (quantidade < 0 || pago < 0) voltar(fd, 'erro', 'Confira a quantidade e o valor.');
  const unidade = UNIDADES.some((u) => u.id === txt(fd, 'unidade')) ? txt(fd, 'unidade') : 'un';
  const conteudo = Math.round(lerValor(txt(fd, 'conteudo')));
  const { error } = await supabase.from('products').insert({
    studio_id: studio.id,
    name: txt(fd, 'nome').slice(0, 80),
    category: txt(fd, 'categoria').slice(0, 40),
    unit: unidade,
    per_pack: temConteudo(unidade) && conteudo >= 1 ? conteudo : null,
    quantity: quantidade,
    min_quantity: lerValor(txt(fd, 'minimo')) || 0,
    unit_cost: quantidade > 0 && pago > 0 ? Math.round((pago / quantidade) * 100) / 100 : 0,
  });
  if (error) voltar(fd, 'erro', amigavel(error));
  // A compra pode entrar direto nas despesas do mês.
  if (txt(fd, 'despesa') && pago > 0) {
    await supabase.from('expenses').insert({
      studio_id: studio.id,
      spent_on: hojeNoFuso(studio.timezone),
      description: `Compra: ${txt(fd, 'nome')}`.slice(0, 120),
      category: 'Material',
      amount: Math.round(pago * 100) / 100,
    });
  }
  revalidatePath('/', 'layout');
  voltar(fd, 'ok', 'Produto cadastrado.');
}

export async function ajustarEstoque(fd) {
  const { supabase } = await studioAtual();
  const delta = Number(txt(fd, 'delta')) || 0;
  const { error } = await supabase.rpc('stock_adjust', { p_id: txt(fd, 'id'), p_delta: delta });
  revalidatePath('/', 'layout');
  if (error) voltar(fd, 'erro', amigavel(error));
  voltar(fd, 'ok', delta < 0 ? 'Baixa feita no estoque.' : 'Estoque atualizado.');
}

export async function reporEstoque(fd) {
  const { supabase, studio } = await studioAtual();
  const qtd = lerValor(txt(fd, 'quantidade'));
  if (!(qtd > 0)) voltar(fd, 'erro', 'Informe quantos chegaram.');
  const { error } = await supabase.rpc('stock_restock', {
    p_id: txt(fd, 'id'),
    p_qty: qtd,
    p_total: lerValor(txt(fd, 'pago')) || 0,
    p_expense: Boolean(txt(fd, 'despesa')),
    p_day: hojeNoFuso(studio.timezone),
  });
  revalidatePath('/', 'layout');
  if (error) voltar(fd, 'erro', amigavel(error));
  voltar(fd, 'ok', txt(fd, 'despesa') && lerValor(txt(fd, 'pago')) > 0 ? 'Estoque reposto e compra lançada nas despesas.' : 'Estoque reposto.');
}

export async function apagarProduto(fd) {
  const { supabase } = await studioAtual();
  const { error } = await supabase.from('products').delete().eq('id', txt(fd, 'id'));
  revalidatePath('/', 'layout');
  if (error) voltar(fd, 'erro', amigavel(error));
  voltar(fd, 'ok', 'Produto apagado.');
}
