// Conexão com o Sistema de Agendamento da Vertex (Supabase). Usa só a chave pública "anon":
// o banco devolve horários sem dados pessoais e só aceita gravar pela função book().

async function rpc(sis, fn, args) {
  const r = await fetch(`${sis.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: sis.chave, Authorization: `Bearer ${sis.chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error(`Sistema ${r.status}`);
  return r.json();
}

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Dados do studio e serviços cadastrados no sistema. */
export const carregarStudio = (sis) => rpc(sis, 'public_studio', { p_slug: sis.studio });

/** Liga os serviços do site aos do sistema pelo nome (o valor e a duração passam a ser os do sistema). */
export function ligarServicos(servicosSite, servicosSistema) {
  const porNome = new Map(servicosSistema.map((s) => [norm(s.name), s]));
  return servicosSite.map((s) => {
    const sv = porNome.get(norm(s.name));
    return sv ? { ...s, uuid: sv.id, minutes: sv.minutes, price: Number(sv.price) } : { ...s, uuid: null };
  });
}

/** Quantos horários livres em cada dia do período: { 'AAAA-MM-DD': n }. */
export async function resumoDias(sis, uuid, de, ate) {
  const linhas = await rpc(sis, 'days_summary', { p_slug: sis.studio, p_service: uuid, p_from: de, p_to: ate });
  return Object.fromEntries(linhas.map((l) => [l.day, l.free_slots]));
}

/** Horários de um dia: [{ time: '09:00', free, startsAt }]. */
export async function horariosDoDia(sis, uuid, dia) {
  const linhas = await rpc(sis, 'day_slots', { p_slug: sis.studio, p_service: uuid, p_day: dia });
  return linhas.map((l) => ({ time: l.slot, free: l.free, startsAt: l.starts_at }));
}

/**
 * Grava o agendamento (aguardando sinal). Devolve { ok, code, deposit, expiresAt } ou { ok: false, reason }.
 * Cliente nova manda também o aniversário (dia e mês).
 */
export const reservar = (sis, { uuid, startsAt, name, phone, birthDay, birthMonth }) =>
  rpc(sis, 'book', {
    p_slug: sis.studio,
    p_service: uuid,
    p_starts: startsAt,
    p_name: name,
    p_phone: phone,
    p_notes: '',
    ...(birthMonth ? { p_birth_day: birthDay, p_birth_month: birthMonth } : {}),
  });
