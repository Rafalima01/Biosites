import { getAdmin } from '@/lib/supabase/server';
import { MONTHS, monthGrid, today, toDay, toISO, formatDate } from '@/lib/dates';
import { houseCalendar } from '@/lib/pricing';
import { effectiveStatus, isHolding } from '@/lib/bookings';
import { addBlock, deleteBlock } from '../../actions';
import { ActionButton, ActionForm } from '@/components/admin/ui';
import { Icon } from '@/components/Icon';

const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default async function Agenda({ searchParams }) {
  const sp = await searchParams;
  const { supabase } = await getAdmin();
  const { data: houses } = await supabase.from('houses').select('*').order('sort').order('created_at');
  if (!houses?.length) {
    return <p className="empty panel">Cadastre uma casa para ver a agenda. <a href="/admin/casas/nova">Cadastrar casa</a></p>;
  }
  const house = houses.find((h) => h.id === sp.casa) || houses[0];
  const now = new Date();
  const [y, m] = /^\d{4}-\d{2}$/.test(sp.mes || '') ? sp.mes.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const year = y;
  const month = m - 1;
  const from = toISO(Date.UTC(year, month, 1) / 86400000);
  const to = toISO(Date.UTC(year, month + 1, 1) / 86400000);
  const prev = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(year, month + 1, 1)).toISOString().slice(0, 7);

  const [{ data: bookings }, { data: blocks }, { data: packages }, { data: promotions }] = await Promise.all([
    supabase.from('bookings').select('*').eq('house_id', house.id).lt('check_in', to).gt('check_out', from),
    supabase.from('blocks').select('*').eq('house_id', house.id).order('starts_on'),
    supabase.from('packages').select('*').eq('house_id', house.id).eq('active', true),
    supabase.from('promotions').select('*').eq('active', true),
  ]);
  const nowMs = Date.now();
  const active = (bookings || []).filter((b) => isHolding(b, nowMs));
  const cal = houseCalendar(house, { promotions: promotions || [], packages: packages || [], busy: [] });
  const t = today();

  const dayInfo = (day) => {
    const b = active.find((x) => day >= toDay(x.check_in) && day < toDay(x.check_out));
    if (b) return { kind: effectiveStatus(b, nowMs) === 'pending' ? 'pending' : 'booked', label: b.guest_name.split(' ')[0], href: `/admin/reservas?status=all&q=${b.code}` };
    const k = (blocks || []).find((x) => day >= toDay(x.starts_on) && day < toDay(x.ends_on));
    if (k) return { kind: 'block', label: k.reason || 'Bloqueado' };
    const p = cal.packageOf(day);
    if (p) return { kind: 'package', label: p.tag || 'Pacote' };
    const promo = cal.promoOf(day);
    return { kind: promo ? 'promo' : 'free', label: cal.priceOf(day).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }), note: promo?.label };
  };
  const upcomingBlocks = (blocks || []).filter((k) => toDay(k.ends_on) >= t);

  return (
    <>
      <header className="admin__head">
        <div>
          <p className="eyebrow">Agenda</p>
          <h1 className="admin__title">{house.name}</h1>
        </div>
      </header>
      <nav className="filters" aria-label="Casa">
        {houses.map((h) => (
          <a key={h.id} className={h.id === house.id ? 'chip is-on' : 'chip'} href={`/admin/agenda?casa=${h.id}&mes=${year}-${String(m).padStart(2, '0')}`}>{h.name}{h.active ? '' : ' (inativa)'}</a>
        ))}
      </nav>

      <section className="panel">
        <div className="calendar__nav">
          <a className="icon-btn" href={`/admin/agenda?casa=${house.id}&mes=${prev}`} aria-label="Mês anterior"><Icon name="chevronLeft" size={20} /></a>
          <p className="calendar__month">{MONTHS[month]} {year}</p>
          <a className="icon-btn" href={`/admin/agenda?casa=${house.id}&mes=${next}`} aria-label="Próximo mês"><Icon name="chevronRight" size={20} /></a>
        </div>
        <div className="acal">
          {WEEK.map((w) => <span key={w} className="acal__wd">{w}</span>)}
          {monthGrid(year, month).map((day, i) => {
            if (day == null) return <span key={`e${i}`} />;
            const info = dayInfo(day);
            const date = new Date(day * 86400000).getUTCDate();
            const Tag = info.href ? 'a' : 'div';
            return (
              <Tag key={day} href={info.href} className={`acal__day acal__day--${info.kind}${day < t ? ' is-past' : ''}${day === t ? ' is-today' : ''}`} title={info.note || info.label}>
                <b>{date}</b>
                <small>{info.label}</small>
              </Tag>
            );
          })}
        </div>
        <ul className="legend">
          <li><span className="legend__dot legend__dot--free" />Livre (preço da noite)</li>
          <li><span className="legend__dot legend__dot--promo" />Promoção</li>
          <li><span className="legend__dot" style={{ background: 'var(--ocean)' }} />Confirmada</li>
          <li><span className="legend__dot" style={{ background: '#d9a441' }} />Aguardando Pix</li>
          <li><span className="legend__dot legend__dot--booked" />Bloqueio manual</li>
          <li><span className="legend__dot legend__dot--package" />Pacote</li>
        </ul>
      </section>

      <div className="admin__cols">
        <section className="panel">
          <h2 className="panel__title">Bloquear datas</h2>
          <p className="panel__hint">Use para reservas feitas no Airbnb/Booking, manutenção ou uso próprio. O site deixa de oferecer essas noites.</p>
          <ActionForm action={addBlock} resetOnSuccess submitLabel="Bloquear">
            <input type="hidden" name="house_id" value={house.id} />
            <div className="grid2">
              <label className="field">Entrada<input type="date" name="starts_on" required min={toISO(t)} /></label>
              <label className="field">Saída<input type="date" name="ends_on" required min={toISO(t + 1)} /></label>
            </div>
            <label className="field">Motivo (só você vê)<input name="reason" placeholder="Ex.: Reserva Airbnb – João" maxLength={60} /></label>
          </ActionForm>
        </section>
        <section className="panel">
          <h2 className="panel__title">Bloqueios ativos</h2>
          {upcomingBlocks.length ? (
            <ul className="rows">
              {upcomingBlocks.map((k) => (
                <li className="row" key={k.id}>
                  <div><strong>{formatDate(k.starts_on)} → {formatDate(k.ends_on)}</strong><span>{k.reason || 'Sem motivo'}</span></div>
                  <ActionButton action={deleteBlock} args={[k.id]} confirm="Remover este bloqueio e liberar as datas?" className="btn btn--ghost btn--sm"><Icon name="trash" size={16} />Liberar</ActionButton>
                </li>
              ))}
            </ul>
          ) : <p className="empty">Nenhum bloqueio.</p>}
        </section>
      </div>
    </>
  );
}
