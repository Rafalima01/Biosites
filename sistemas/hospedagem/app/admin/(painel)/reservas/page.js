import { getAdmin } from '@/lib/supabase/server';
import { formatDate } from '@/lib/dates';
import { brl, plural } from '@/lib/format';
import { effectiveStatus, guestWhatsApp } from '@/lib/bookings';
import { setBookingStatus } from '../../actions';
import { ActionButton, StatusBadge } from '@/components/admin/ui';
import { Icon } from '@/components/Icon';

const FILTERS = [
  ['pending', 'Aguardando Pix'],
  ['confirmed', 'Confirmadas'],
  ['closed', 'Canceladas e expiradas'],
  ['all', 'Todas'],
];

export default async function Reservas({ searchParams }) {
  const { status = 'pending', q = '' } = await searchParams;
  const { supabase } = await getAdmin();
  let query = supabase.from('bookings').select('*, houses(name), packages(title)').order('created_at', { ascending: false }).limit(300);
  if (q) query = query.or(`guest_name.ilike.%${q.replace(/[%,()]/g, '')}%,code.ilike.%${q.replace(/[%,()]/g, '')}%`);
  const { data } = await query;
  const now = Date.now();
  const list = (data || []).filter((b) => {
    const s = effectiveStatus(b, now);
    if (status === 'all') return true;
    if (status === 'closed') return s === 'cancelled' || s === 'expired';
    return s === status;
  });

  return (
    <>
      <header className="admin__head">
        <div>
          <p className="eyebrow">Reservas</p>
          <h1 className="admin__title">Reservas do site</h1>
        </div>
        <form className="search-box" action="/admin/reservas">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder="Buscar por nome ou código" aria-label="Buscar reservas" />
        </form>
      </header>
      <nav className="filters" aria-label="Filtrar reservas">
        {FILTERS.map(([key, label]) => (
          <a key={key} href={`/admin/reservas?status=${key}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className={status === key ? 'chip is-on' : 'chip'}>{label}</a>
        ))}
      </nav>

      {list.length ? (
        <ul className="booking-list">
          {list.map((b) => {
            const s = effectiveStatus(b, now);
            const confirmMsg = `Olá, ${b.guest_name.split(' ')[0]}! Recebemos o sinal e sua reserva ${b.code} na ${b.houses?.name} (${formatDate(b.check_in)} a ${formatDate(b.check_out)}) está confirmada. Até breve!`;
            const remindMsg = `Olá, ${b.guest_name.split(' ')[0]}! Sua reserva ${b.code} na ${b.houses?.name} está aguardando o sinal de ${brl(b.deposit)} via Pix. Qualquer dúvida, estou à disposição.`;
            return (
              <li key={b.id} className="booking-item">
                <div className="booking-item__main">
                  <div className="booking-item__top">
                    <StatusBadge status={s} />
                    <code>{b.code}</code>
                  </div>
                  <h3>{b.guest_name}</h3>
                  <p>{b.houses?.name}{b.packages?.title ? ` · Pacote ${b.packages.title}` : ''}</p>
                  <p><Icon name="calendar" size={15} />{formatDate(b.check_in)} → {formatDate(b.check_out)} · {plural(b.nights, 'noite', 'noites')} · {plural(b.guests, 'hóspede', 'hóspedes')}</p>
                  <p><Icon name="whatsapp" size={15} />{b.guest_phone}{b.guest_email ? ` · ${b.guest_email}` : ''}</p>
                  {b.notes ? <p className="booking-item__notes">“{b.notes}”</p> : null}
                  {s === 'pending' ? <p className="booking-item__exp">Prazo do Pix: {new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(b.expires_at))}</p> : null}
                </div>
                <div className="booking-item__money">
                  <span>Total</span><strong>{brl(b.total)}</strong>
                  <span>Sinal</span><strong>{brl(b.deposit)}</strong>
                </div>
                <div className="booking-item__actions">
                  {s === 'pending' ? (
                    <ActionButton action={setBookingStatus} args={[b.id, 'confirmed']} className="btn btn--primary btn--sm" confirm={`Confirmar o recebimento do sinal de ${brl(b.deposit)} de ${b.guest_name}?`}>
                      <Icon name="check" size={16} />Confirmar Pix
                    </ActionButton>
                  ) : null}
                  {s === 'expired' || s === 'cancelled' ? (
                    <ActionButton action={setBookingStatus} args={[b.id, 'pending']} confirm="Reativar esta reserva por mais 24h (se as datas ainda estiverem livres)?">Reativar</ActionButton>
                  ) : null}
                  {s === 'pending' || s === 'confirmed' ? (
                    <ActionButton action={setBookingStatus} args={[b.id, 'cancelled']} className="btn btn--danger btn--sm" confirm={`Cancelar a reserva ${b.code}? As datas serão liberadas.`}>Cancelar</ActionButton>
                  ) : null}
                  <a className="btn btn--ghost btn--sm" href={guestWhatsApp(b, s === 'confirmed' ? confirmMsg : remindMsg)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={16} />{s === 'confirmed' ? 'Avisar hóspede' : 'Chamar hóspede'}</a>
                  <a className="btn btn--ghost btn--sm" href={`/reserva/${b.code}`} target="_blank" rel="noopener noreferrer"><Icon name="eye" size={16} />Página do hóspede</a>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty panel">Nenhuma reserva neste filtro.</p>
      )}
    </>
  );
}
