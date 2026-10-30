'use server';
// Ações do painel. O banco confere de novo se a pessoa é do studio (RLS e funções).
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPainel, supabaseServer } from '@/lib/supabase/server';
import { diaCurto, diaDe, hora, noFuso } from '@/lib/datas';

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
