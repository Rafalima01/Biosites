// Agenda interativa: escolha da casa, período, hóspedes, orçamento e envio pelo WhatsApp.
import { MONTHS, monthGrid, today, formatShort } from '../lib/dates.js';
import { houseCalendar, brl } from '../lib/pricing.js';
import { whatsappUrl, pendingMessage } from '../lib/links.js';
import { bookingMessage } from '../lib/messages.js';

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const STATUS_LABEL = { free: 'disponível', high: 'disponível', package: 'pacote', booked: 'ocupado' };
const compact = (v) => v.toLocaleString('pt-BR');

export function initBooking(root, { toast, sheets, scrollToSection }) {
  const dataEl = document.getElementById('booking-data');
  if (!root || !dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const $ = (sel) => root.querySelector(sel);
  const section = root.closest('section');

  const now = today();
  const start = new Date();
  const state = {
    house: data.houses[0],
    year: start.getFullYear(),
    month: start.getMonth(),
    checkIn: null,
    checkOut: null,
    guests: Math.min(2, data.houses[0].guests),
  };
  const firstMonth = state.year * 12 + state.month;
  // Mês quase no fim: abre a agenda já no mês seguinte (o anterior continua acessível).
  if (new Date(state.year, state.month + 1, 0).getDate() - start.getDate() < 7) {
    state.year = Math.floor((firstMonth + 1) / 12);
    state.month = (firstMonth + 1) % 12;
  }
  let cal = houseCalendar(data, state.house);

  const quote = () =>
    state.checkIn != null && state.checkOut != null ? cal.quote(state.checkIn, state.checkOut, data.platformFee) : null;

  function renderCalendar() {
    const offset = state.year * 12 + state.month;
    $('[data-month-label]').textContent = `${MONTHS[state.month]} ${state.year}`;
    $('[data-month="-1"]').disabled = offset <= firstMonth;
    $('[data-month="1"]').disabled = offset >= firstMonth + 12;

    const head = WEEK.map((w) => `<span class="calendar__wd" aria-hidden="true">${w}</span>`).join('');
    const cells = monthGrid(state.year, state.month)
      .map((day) => {
        if (day == null) return '<span class="calendar__empty"></span>';
        const date = new Date(day * 86400000).getUTCDate();
        if (day < now) return `<span class="day day--past" aria-hidden="true"><b>${date}</b></span>`;
        const status = cal.statusOf(day);
        const price = cal.priceOf(day);
        const sub = status === 'booked' ? '' : status === 'package' ? 'Pacote' : compact(price);
        const classes = ['day', `day--${status}`];
        if (day === now) classes.push('day--today');
        if (day === state.checkIn) classes.push('day--start');
        if (day === state.checkOut) classes.push('day--end');
        if (state.checkIn != null && state.checkOut != null && day > state.checkIn && day < state.checkOut) classes.push('day--range');
        const label = `${formatShort(day)}, ${STATUS_LABEL[status]}${status === 'free' || status === 'high' ? `, ${brl(price)} a noite` : ''}`;
        const pressed = day === state.checkIn || day === state.checkOut;
        return `<button type="button" class="${classes.join(' ')}" data-day="${day}" aria-label="${label}" aria-pressed="${pressed}"><b>${date}</b><small>${sub}</small></button>`;
      })
      .join('');
    $('[data-calendar]').innerHTML = `<div class="calendar__grid">${head}${cells}</div>`;
  }

  function renderSummary() {
    const q = quote();
    const { house } = state;
    $('[data-summary-house]').textContent = house.name;
    $('[data-checkin]').textContent = state.checkIn != null ? formatShort(state.checkIn) : 'Escolha';
    $('[data-checkout]').textContent = state.checkOut != null ? formatShort(state.checkOut) : state.checkIn != null ? 'Escolha a saída' : 'Escolha';
    $('[data-guests-value]').textContent = String(state.guests);
    $('[data-guests="-1"]').disabled = state.guests <= 1;
    $('[data-guests="1"]').disabled = state.guests >= house.guests;

    const breakdown = $('[data-breakdown]');
    const savings = $('[data-savings]');
    const hint = $('[data-hint]');
    breakdown.hidden = !q?.ok;
    savings.hidden = !(q?.ok && q.savings > 0);
    hint.hidden = Boolean(q?.ok);
    if (q?.ok) {
      $('[data-lodging-label]').textContent = `${q.nights} ${q.nights === 1 ? 'noite' : 'noites'}`;
      $('[data-lodging]').textContent = brl(q.lodging);
      $('[data-cleaning]').textContent = brl(q.cleaning);
      $('[data-total]').textContent = brl(q.total);
      savings.querySelector('span').textContent = `Você economiza cerca de ${brl(q.savings)} sem a taxa de serviço das plataformas.`;
    } else {
      hint.textContent =
        state.checkIn != null
          ? `Agora toque na data de saída · mínimo de ${house.minNights || 1} noites`
          : `A partir de ${brl(house.price)}/noite · mínimo de ${house.minNights || 1} noites · até ${house.guests} hóspedes`;
    }

    // Resumo na busca do topo e na barra inferior.
    const searchSummary = document.querySelector('[data-search-summary]');
    if (searchSummary) {
      searchSummary.textContent = q?.ok
        ? `${house.name} · ${formatShort(state.checkIn)} → ${formatShort(state.checkOut)} · ${state.guests} hóspedes`
        : `${house.name} · Escolha as datas · ${state.guests} hóspedes`;
    }
    const barInfo = document.querySelector('[data-bar-info]');
    const barCta = document.querySelector('[data-bar-cta]');
    if (barInfo && barCta) {
      barInfo.innerHTML = q?.ok
        ? `<span>${house.name} · ${q.nights} noites</span><strong>${brl(q.total)}</strong>`
        : `<span>${house.name}</span><strong>${brl(house.price)}<small>/noite</small></strong>`;
      barCta.textContent = q?.ok ? 'Reservar' : 'Ver datas';
    }
  }

  const render = () => {
    renderCalendar();
    renderSummary();
  };

  function selectHouse(id) {
    const house = data.houses.find((h) => h.id === id);
    if (!house) return;
    state.house = house;
    state.checkIn = state.checkOut = null;
    state.guests = Math.min(Math.max(state.guests, 1), house.guests);
    cal = houseCalendar(data, house);
    root.querySelectorAll('[data-house]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.house === id)));
    render();
  }

  function pickDay(day) {
    const status = cal.statusOf(day);
    const choosingCheckout = state.checkIn != null && state.checkOut == null && day > state.checkIn;

    if (choosingCheckout) {
      const q = cal.quote(state.checkIn, day, data.platformFee);
      if (q.ok) state.checkOut = day;
      else toast.show(q.reason);
    } else if (status === 'booked') {
      toast.show('Essa data já está ocupada. Escolha outro dia de entrada.');
      return;
    } else if (status === 'package') {
      const pkg = cal.packageOf(day);
      toast.show(`Essa data faz parte do pacote ${pkg.tag} (${pkg.title}). Veja em Pacotes.`);
      return;
    } else {
      state.checkIn = day;
      state.checkOut = null;
    }
    render();
    root.querySelector(`[data-day="${day}"]`)?.focus();
  }

  function book() {
    const q = quote();
    if (!q?.ok) {
      toast.show('Escolha as datas de entrada e saída na agenda.');
      scrollToSection(section);
      return;
    }
    const message = bookingMessage(state.house, { checkIn: state.checkIn, checkOut: state.checkOut, guests: state.guests, quote: q });
    const href = whatsappUrl(data.whatsapp, message);
    if (href) {
      window.open(href, '_blank', 'noopener');
    } else if (data.demo && document.getElementById('demo-message')) {
      document.querySelector('[data-demo-text]').textContent = message;
      sheets.open('demo-message');
    } else {
      toast.show(pendingMessage('WhatsApp'));
    }
  }

  // Eventos
  root.addEventListener('click', (event) => {
    const dayBtn = event.target.closest('[data-day]');
    if (dayBtn) return pickDay(Number(dayBtn.dataset.day));
    const houseBtn = event.target.closest('[data-house]');
    if (houseBtn) return selectHouse(houseBtn.dataset.house);
    const monthBtn = event.target.closest('[data-month]');
    if (monthBtn) {
      const m = state.year * 12 + state.month + Number(monthBtn.dataset.month);
      state.year = Math.floor(m / 12);
      state.month = m % 12;
      return renderCalendar();
    }
    const guestsBtn = event.target.closest('[data-guests]');
    if (guestsBtn) {
      state.guests = Math.min(Math.max(state.guests + Number(guestsBtn.dataset.guests), 1), state.house.guests);
      return renderSummary();
    }
    if (event.target.closest('[data-book]')) book();
  });

  // Setas do teclado na agenda (casinha por casinha).
  root.addEventListener('keydown', (event) => {
    const btn = event.target.closest('[data-day]');
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (!btn || !step) return;
    const next = root.querySelector(`[data-day="${Number(btn.dataset.day) + step}"]`);
    if (next) {
      event.preventDefault();
      next.focus();
    }
  });

  // Cards e janelas: "Reservar" escolhe a casa e leva até a agenda.
  document.addEventListener('click', (event) => {
    const pick = event.target.closest('[data-pick-house]');
    if (!pick) return;
    selectHouse(pick.dataset.pickHouse);
    sheets.closeAll();
    scrollToSection(section);
  });

  // Barra inferior (celular): leva à agenda ou envia a reserva.
  document.querySelector('[data-bar-cta]')?.addEventListener('click', () => (quote()?.ok ? book() : scrollToSection(section)));

  // Esconde a barra inferior enquanto o resumo da reserva está na tela.
  const bar = document.querySelector('[data-bottombar]');
  const summary = root.querySelector('.summary');
  if (bar && summary && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => bar.classList.toggle('is-hidden', e.isIntersecting)).observe(summary);
  }

  render();
}
