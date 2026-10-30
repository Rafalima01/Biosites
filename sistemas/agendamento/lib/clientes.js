// Clientes do studio com o histórico resumido. Usado em Clientes, Melhores clientes e Aniversariantes.
// O gasto conta os atendimentos marcados como "Realizado" (mesma regra do financeiro).

const DIA = 86400000;

export const fone = (d) =>
  d?.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d?.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d || '';

export const aniversario = (c) => (c.birth_day && c.birth_month ? `${String(c.birth_day).padStart(2, '0')}/${String(c.birth_month).padStart(2, '0')}` : '');

export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** Busca as clientes com os agendamentos e calcula gasto, visitas, última vez, frequência e próximo horário. */
export async function carregarClientes(supabase, studioId) {
  const { data } = await supabase
    .from('clients')
    .select('id, name, phone, created_at, birth_day, birth_month, appointments(starts_at, status, price, service_name)')
    .eq('studio_id', studioId)
    .order('name');
  const agora = Date.now();
  return (data || []).map((c) => {
    const ags = c.appointments || [];
    const feitos = ags.filter((a) => a.status === 'done').sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const proximo = ags
      .filter((a) => ['confirmed', 'pending'].includes(a.status) && new Date(a.starts_at).getTime() >= agora)
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
    const ultimo = feitos[feitos.length - 1];
    const gasto = feitos.reduce((s, a) => s + Number(a.price), 0);
    // Frequência: média de dias entre uma visita e outra (precisa de pelo menos 2).
    const frequencia =
      feitos.length >= 2 ? Math.round((new Date(ultimo.starts_at) - new Date(feitos[0].starts_at)) / DIA / (feitos.length - 1)) : null;
    const servicos = {};
    for (const a of feitos) servicos[a.service_name] = (servicos[a.service_name] || 0) + 1;
    const favorito = Object.entries(servicos).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    return {
      ...c,
      atendimentos: feitos.length,
      gasto,
      ticket: feitos.length ? gasto / feitos.length : 0,
      faltas: ags.filter((a) => a.status === 'no_show').length,
      ultimo,
      proximo,
      frequencia,
      favorito,
      diasSemVir: ultimo ? Math.floor((agora - new Date(ultimo.starts_at)) / DIA) : null,
    };
  });
}
