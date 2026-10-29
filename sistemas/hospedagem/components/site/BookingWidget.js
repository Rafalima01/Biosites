'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { MONTHS, monthGrid, today, toDay, toISO, formatShort } from '@/lib/dates';
import { houseCalendar } from '@/lib/pricing';
import { brl, plural, whatsappUrl } from '@/lib/format';
import { Icon } from '@/components/Icon';
import { pickInBooking } from './PickButton';

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const LEGEND = [
  ['free', 'Disponível'],
  ['promo', 'Promoção'],
  ['high', 'Fim de semana / temporada'],
  ['package', 'Pacote'],
  ['booked', 'Ocupado'],
];

export function BookingWidget({ houses, promotions, packages, booking, whatsapp }) {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const now = today();
  const startDate = new Date();
  const firstMonth = startDate.getFullYear() * 12 + startDate.getMonth();
  const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
  // Mês quase no fim: a agenda já abre no mês seguinte.
  const initialMonth = lastDayOfMonth - startDate.getDate() < 7 ? firstMonth + 1 : firstMonth;

  const [houseId, setHouseId] = useState(houses[0]?.id);
  const [month, setMonth] = useState(initialMonth);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [packageId, setPackageId] = useState(null);
  const [guests, setGuests] = useState(2);
  const [busy, setBusy] = useState({});
  const [step, setStep] = useState('dates');
  const [quote, setQuote] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '', accept: false });
  const summaryRef = useRef(null);
  const [summaryVisible, setSummaryVisible] = useState(false);

  const house = houses.find((h) => h.id === houseId) || houses[0];
  const pkg = packages.find((p) => p.id === packageId) || null;

  const loadBusy = useCallback(
    async (id, force = false) => {
      if (!id || (busy[id] && !force)) return;
      const { data, error } = await supabase.rpc('house_busy', { p_house: id, p_from: toISO(now), p_to: toISO(now + 420) });
      if (!error) setBusy((b) => ({ ...b, [id]: data || [] }));
    },
    [busy, supabase, now],
  );

  useEffect(() => {
    loadBusy(houseId);
  }, [houseId, loadBusy]);

  const cal = useMemo(
    () => (house ? houseCalendar(house, { promotions, packages, busy: busy[house.id] || [] }) : null),
    [house, promotions, packages, busy],
  );

  const local = useMemo(() => {
    if (!cal || checkIn == null || checkOut == null) return null;
    if (pkg) return { ok: true, nights: checkOut - checkIn, lodging: Number(pkg.price), cleaning: 0, total: Number(pkg.price) };
    return cal.check(checkIn, checkOut);
  }, [cal, checkIn, checkOut, pkg]);

  const resetDates = () => {
    setCheckIn(null);
    setCheckOut(null);
    setPackageId(null);
    setStep('dates');
    setQuote(null);
    setMessage('');
  };

  const selectHouse = (id) => {
    if (id === houseId) return;
    setHouseId(id);
    const h = houses.find((x) => x.id === id);
    setGuests((g) => Math.min(Math.max(g, 1), h?.guests || 1));
    resetDates();
  };

  // Casas e pacotes escolhidos em outras partes da página.
  useEffect(() => {
    const onPick = (e) => {
      const { houseId: id, packageId: pid } = e.detail || {};
      const h = houses.find((x) => x.id === id);
      if (!h) return;
      setHouseId(id);
      setGuests((g) => Math.min(Math.max(g, 1), h.guests));
      setStep('dates');
      setQuote(null);
      setMessage('');
      const p = packages.find((x) => x.id === pid);
      if (p) {
        const inDay = toDay(p.starts_on);
        setPackageId(p.id);
        setCheckIn(inDay);
        setCheckOut(toDay(p.ends_on));
        const d = new Date(inDay * 86400000);
        setMonth(d.getUTCFullYear() * 12 + d.getUTCMonth());
      } else {
        setPackageId(null);
        setCheckIn(null);
        setCheckOut(null);
      }
    };
    window.addEventListener('booking:pick', onPick);
    return () => window.removeEventListener('booking:pick', onPick);
  }, [houses, packages]);

  // Esconde a barra inferior quando o resumo está na tela.
  useEffect(() => {
    const el = summaryRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setSummaryVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function pickDay(day) {
    setMessage('');
    const status = cal.statusOf(day);
    const choosingCheckout = checkIn != null && checkOut == null && day > checkIn && !pkg;
    if (choosingCheckout) {
      const q = cal.check(checkIn, day);
      if (q.ok) setCheckOut(day);
      else setMessage(q.reason);
      return;
    }
    if (status === 'booked') return setMessage('Essa data já está ocupada. Escolha outro dia de entrada.');
    if (status === 'package') {
      const p = cal.packageOf(day);
      return setMessage(`Essa data faz parte do pacote "${p.title}". Reserve o pacote completo em Pacotes.`);
    }
    setPackageId(null);
    setCheckIn(day);
    setCheckOut(null);
    setStep('dates');
  }

  async function goToForm() {
    if (!local?.ok) {
      setMessage(local?.reason || 'Escolha as datas de entrada e saída na agenda.');
      return;
    }
    setSending(true);
    const { data, error } = await supabase.rpc('quote_booking', {
      p_house: house.id,
      p_check_in: toISO(checkIn),
      p_check_out: toISO(checkOut),
      p_package: packageId,
    });
    setSending(false);
    if (error || !data?.ok) {
      setMessage(data?.reason || 'Não foi possível calcular agora. Tente novamente.');
      loadBusy(house.id, true);
      return;
    }
    setQuote(data);
    setStep('form');
    setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.accept) return setMessage('Para continuar, aceite as condições da reserva.');
    setSending(true);
    setMessage('');
    const { data, error } = await supabase.rpc('create_booking', {
      p_house: house.id,
      p_check_in: toISO(checkIn),
      p_check_out: toISO(checkOut),
      p_guests: guests,
      p_name: form.name,
      p_phone: form.phone,
      p_email: form.email,
      p_notes: form.notes,
      p_package: packageId,
    });
    if (error || !data?.ok) {
      setSending(false);
      setMessage(data?.reason || 'Não foi possível concluir agora. Tente novamente em instantes.');
      if (/dispon|pacote/i.test(data?.reason || '')) {
        loadBusy(house.id, true);
        resetDates();
      }
      return;
    }
    router.push(`/reserva/${data.code}`);
  }

  if (!house) return <p className="section__lead">Nenhuma casa disponível no momento.</p>;

  const offset = month;
  const year = Math.floor(offset / 12);
  const m = offset % 12;
  const ready = Boolean(local?.ok);
  const platformFee = Number(booking.platformFee || 0);
  const savings = ready ? Math.round((local.total * platformFee) / 100) : 0;
  const ask = whatsappUrl(whatsapp, `Olá! Tenho uma dúvida sobre a ${house.name}.`);

  return (
    <>
      <div className="booking__grid">
        <div className="calendar-card">
          <div className="house-picker" role="radiogroup" aria-label="Casa">
            {houses.map((h) => (
              <button key={h.id} type="button" className="chip" role="radio" aria-checked={h.id === houseId} onClick={() => selectHouse(h.id)}>
                {h.name}
              </button>
            ))}
          </div>
          <div className="calendar__nav">
            <button className="icon-btn" type="button" disabled={offset <= firstMonth} onClick={() => setMonth(offset - 1)} aria-label="Mês anterior">
              <Icon name="chevronLeft" size={20} />
            </button>
            <p className="calendar__month" aria-live="polite">{MONTHS[m]} {year}</p>
            <button className="icon-btn" type="button" disabled={offset >= firstMonth + 13} onClick={() => setMonth(offset + 1)} aria-label="Próximo mês">
              <Icon name="chevronRight" size={20} />
            </button>
          </div>
          <div className="calendar">
            <div className="calendar__grid">
              {WEEK.map((w, i) => <span key={i} className="calendar__wd" aria-hidden="true">{w}</span>)}
              {monthGrid(year, m).map((day, i) => {
                if (day == null) return <span key={`e${i}`} className="calendar__empty" />;
                const date = new Date(day * 86400000).getUTCDate();
                if (day < now) return <span key={day} className="day day--past" aria-hidden="true"><b>{date}</b></span>;
                const status = cal.statusOf(day);
                const price = cal.priceOf(day);
                const sub = status === 'booked' ? '' : status === 'package' ? 'Pacote' : price.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
                const cls = ['day', `day--${status}`];
                if (day === now) cls.push('day--today');
                if (day === checkIn) cls.push('day--start');
                if (day === checkOut) cls.push('day--end');
                if (checkIn != null && checkOut != null && day > checkIn && day < checkOut) cls.push('day--range');
                const label = `${formatShort(day)}, ${status === 'booked' ? 'ocupado' : status === 'package' ? 'pacote' : `disponível, ${brl(price)} a noite`}`;
                return (
                  <button key={day} type="button" className={cls.join(' ')} onClick={() => pickDay(day)} aria-label={label} aria-pressed={day === checkIn || day === checkOut}>
                    <b>{date}</b>
                    <small>{sub}</small>
                  </button>
                );
              })}
            </div>
          </div>
          <ul className="legend">
            {LEGEND.map(([k, l]) => <li key={k}><span className={`legend__dot legend__dot--${k}`} />{l}</li>)}
          </ul>
        </div>

        <aside className="summary" ref={summaryRef} aria-labelledby="summary-title">
          <h3 className="summary__title" id="summary-title">{step === 'form' ? 'Seus dados' : 'Sua reserva'}</h3>
          <p className="summary__house">{house.name}{pkg ? ` · Pacote ${pkg.title}` : ''}</p>
          <div className="summary__dates">
            <div><span>Entrada</span><strong>{checkIn != null ? formatShort(checkIn) : 'Escolha'}</strong></div>
            <div><span>Saída</span><strong>{checkOut != null ? formatShort(checkOut) : checkIn != null ? 'Escolha a saída' : 'Escolha'}</strong></div>
          </div>
          <div className="stepper">
            <span>Hóspedes</span>
            <div className="stepper__ctrl">
              <button className="icon-btn" type="button" disabled={guests <= 1} onClick={() => setGuests(guests - 1)} aria-label="Menos hóspedes"><Icon name="minus" size={18} /></button>
              <output aria-live="polite">{guests}</output>
              <button className="icon-btn" type="button" disabled={guests >= house.guests} onClick={() => setGuests(guests + 1)} aria-label="Mais hóspedes"><Icon name="plus" size={18} /></button>
            </div>
          </div>

          {ready ? (
            <dl className="breakdown">
              <div><dt>{pkg ? `Pacote · ${plural(local.nights, 'noite', 'noites')}` : plural(local.nights, 'noite', 'noites')}</dt><dd>{brl((quote || local).lodging)}</dd></div>
              {Number((quote || local).cleaning) > 0 ? <div><dt>Taxa de limpeza</dt><dd>{brl((quote || local).cleaning)}</dd></div> : null}
              <div className="breakdown__total"><dt>Total</dt><dd>{brl((quote || local).total)}</dd></div>
              {quote ? <div className="breakdown__deposit"><dt>Sinal via Pix ({quote.depositPercent}%)</dt><dd>{brl(quote.deposit)}</dd></div> : null}
            </dl>
          ) : (
            <p className="summary__hint">
              {checkIn != null
                ? `Agora toque na data de saída · mínimo de ${plural(house.min_nights, 'noite', 'noites')}`
                : `A partir de ${brl(house.price)}/noite · mínimo de ${plural(house.min_nights, 'noite', 'noites')} · até ${house.guests} hóspedes`}
            </p>
          )}
          {ready && savings > 0 && step === 'dates' ? (
            <p className="savings"><Icon name="tag" size={16} /><span>Você economiza cerca de {brl(savings)} sem a taxa de serviço das plataformas.</span></p>
          ) : null}

          {message ? <p className="form-error" role="alert">{message}</p> : null}

          {step === 'dates' ? (
            <>
              <button className="btn btn--primary btn--block" type="button" onClick={goToForm} disabled={sending}>
                {sending ? 'Calculando…' : ready ? 'Continuar' : 'Escolha as datas'}
              </button>
              <p className="summary__note">Sem cobrança agora. Você só paga o sinal via Pix depois de reservar.</p>
            </>
          ) : (
            <form className="guest-form" onSubmit={submit}>
              <label>Nome completo<input required minLength={3} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>WhatsApp com DDD<input required type="tel" inputMode="tel" autoComplete="tel" placeholder="(71) 99999-9999" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label>E-mail <small>(opcional)</small><input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label>Observações <small>(opcional)</small><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Horário de chegada, pets, pedidos especiais…" /></label>
              {booking.terms ? <p className="terms">{booking.terms}</p> : null}
              <label className="check">
                <input type="checkbox" checked={form.accept} onChange={(e) => setForm({ ...form, accept: e.target.checked })} />
                <span>Li e aceito as condições da reserva.</span>
              </label>
              <button className="btn btn--primary btn--block" type="submit" disabled={sending}>
                <Icon name="lock" size={18} />{sending ? 'Reservando…' : 'Reservar agora'}
              </button>
              <button className="btn btn--ghost btn--block" type="button" onClick={() => { setStep('dates'); setQuote(null); }}>Voltar e alterar datas</button>
              <p className="summary__note">
                As datas ficam garantidas por {booking.holdHours || 24}h enquanto você paga o sinal.
                {ask ? <> Dúvidas? <a href={ask} target="_blank" rel="noopener noreferrer">Fale no WhatsApp</a>.</> : null}
              </p>
            </form>
          )}
        </aside>
      </div>

      <div className={`bottombar${summaryVisible ? ' is-hidden' : ''}`}>
        <p className="bottombar__info">
          <span>{ready ? `${house.name} · ${plural(local.nights, 'noite', 'noites')}` : house.name}</span>
          {ready ? <strong>{brl(local.total)}</strong> : <strong>{brl(house.price)}<small>/noite</small></strong>}
        </p>
        <button className="btn btn--primary" type="button" onClick={() => (ready ? summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) : pickInBooking({ houseId }))}>
          {ready ? 'Reservar' : 'Ver datas'}
        </button>
      </div>
    </>
  );
}

