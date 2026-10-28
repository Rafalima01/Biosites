import { getAdmin } from '@/lib/supabase/server';
import { today, toISO, toDay, formatDate } from '@/lib/dates';
import { brl, plural } from '@/lib/format';
import { effectiveStatus, isHolding } from '@/lib/bookings';
import { StatusBadge } from '@/components/admin/ui';
import { Icon } from '@/components/Icon';

export default async function Dashboard() {
  const { supabase } = await getAdmin();
  const t = today();
  const in30 = t + 30;
  const monthStart = new Date();
  const mStart = toISO(Date.UTC(monthStart.getFullYear(), monthStart.getMonth(), 1) / 86400000);
  const mEnd = toISO(Date.UTC(monthStart.getFullYear(), monthStart.getMonth() + 1, 1) / 86400000);

  const [{ data: houses }, { data: bookings }, { data: blocks }] = await Promise.all([
    supabase.from('houses').select('id, name, active').eq('active', true),
    supabase.from('bookings').select('*, houses(name)').gte('check_out', toISO(t - 60)).order('check_in'),
    supabase.from('blocks').select('*').gte('ends_on', toISO(t)),
  ]);
  const list = bookings || [];
  const now = Date.now();
  const pending = list.filter((b) => effectiveStatus(b, now) === 'pending');
  const confirmedMonth = list.filter((b) => b.status === 'confirmed' && b.check_in >= mStart && b.check_in < mEnd);
  const revenueMonth = confirmedMonth.reduce((s, b) => s + Number(b.total), 0);
  const upcoming = list.filter((b) => isHolding(b, now) && toDay(b.check_in) >= t).slice(0, 6);

  // Ocupação dos próximos 30 dias (reservas ativas + bloqueios) sobre o total de noites das casas ativas.
  const nightsTaken = new Set();
  const mark = (houseId, from, to) => {
    for (let d = Math.max(toDay(from), t); d < Math.min(toDay(to), in30); d++) nightsTaken.add(`${houseId}:${d}`);
  };
  list.filter((b) => isHolding(b, now)).forEach((b) => mark(b.house_id, b.check_in, b.check_out));
  (blocks || []).forEach((k) => mark(k.house_id, k.starts_on, k.ends_on));
  const capacity = (houses?.length || 0) * 30;
  const occupancy = capacity ? Math.round((nightsTaken.size / capacity) * 100) : 0;

  const recent = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  return (
    <>
      <header className="admin__head">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h1 className="admin__title">Olá! Aqui está o resumo de hoje.</h1>
        </div>
        <a className="btn btn--primary btn--sm" href="/admin/agenda"><Icon name="calendar" size={18} />Abrir agenda</a>
      </header>

      <section className="kpis">
        <a className="kpi kpi--warn" href="/admin/reservas?status=pending">
          <span>Aguardando Pix</span>
          <strong>{pending.length}</strong>
          <small>{brl(pending.reduce((s, b) => s + Number(b.deposit), 0))} em sinais</small>
        </a>
        <div className="kpi">
          <span>Confirmadas no mês</span>
          <strong>{confirmedMonth.length}</strong>
          <small>{brl(revenueMonth)} em reservas</small>
        </div>
        <div className="kpi">
          <span>Ocupação · próximos 30 dias</span>
          <strong>{occupancy}%</strong>
          <small>{plural(nightsTaken.size, 'noite ocupada', 'noites ocupadas')} de {capacity}</small>
        </div>
        <div className="kpi">
          <span>Casas ativas</span>
          <strong>{houses?.length || 0}</strong>
          <small><a href="/admin/casas">Gerenciar casas</a></small>
        </div>
      </section>

      <div className="admin__cols">
        <section className="panel">
          <h2 className="panel__title">Próximas chegadas</h2>
          {upcoming.length ? (
            <ul className="rows">
              {upcoming.map((b) => (
                <li key={b.id} className="row">
                  <div>
                    <strong>{b.guest_name}</strong>
                    <span>{b.houses?.name} · {formatDate(b.check_in)} → {formatDate(b.check_out)} · {plural(b.guests, 'hóspede', 'hóspedes')}</span>
                  </div>
                  <StatusBadge status={effectiveStatus(b, now)} />
                </li>
              ))}
            </ul>
          ) : <p className="empty">Nenhuma chegada marcada.</p>}
        </section>
        <section className="panel">
          <h2 className="panel__title">Reservas recentes</h2>
          {recent.length ? (
            <ul className="rows">
              {recent.map((b) => (
                <li key={b.id} className="row">
                  <div>
                    <strong>{b.guest_name} · {brl(b.total)}</strong>
                    <span>{b.houses?.name} · feita em {new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(b.created_at))}</span>
                  </div>
                  <StatusBadge status={effectiveStatus(b, now)} />
                </li>
              ))}
            </ul>
          ) : <p className="empty">As reservas feitas no site aparecem aqui.</p>}
          <a className="panel__link" href="/admin/reservas">Ver todas as reservas</a>
        </section>
      </div>
    </>
  );
}
