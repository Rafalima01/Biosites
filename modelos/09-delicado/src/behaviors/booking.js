// Agendamento online: serviço → dia e horário livres → dados → revisão → sinal por Pix → WhatsApp.
// Nada é gravado: os horários ocupados vêm da agenda do Google (/api/disponibilidade) e o pedido
// segue como mensagem para o WhatsApp, onde a profissional confirma com o comprovante do sinal.
import { renderSVG } from 'uqr';
import { pixPayload } from '../lib/pix.js';
import { addDays, deposit, localDate, slotsForDay, weekday } from '../lib/agenda.js';

const ORDER = ['servico', 'data', 'dados', 'revisao', 'sinal', 'pronto'];
const duration = (m) => (m % 60 === 0 ? `${m / 60} h` : m > 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
const money = (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })}`;
const moneyCents = (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (date, opts) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', ...opts }).format(new Date(`${date}T12:00:00Z`));
const longDate = (date) => fmt(date, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const digits = (s) => String(s).replace(/\D/g, '');

function phoneMask(value) {
  const d = digits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = Object.assign(document.createElement('textarea'), { value: text, readOnly: true });
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export function initBooking(root, { toast }) {
  const cfg = JSON.parse(root.querySelector('[data-booking-config]').textContent);
  const { rules } = cfg;
  const $ = (sel) => root.querySelector(sel);
  const steps = Object.fromEntries([...root.querySelectorAll('[data-step]')].map((el) => [el.dataset.step, el]));
  const dots = [...root.querySelectorAll('[data-dot]')];
  const form = steps.dados;

  const today = localDate(Date.now(), rules.offset);
  const last = addDays(today, rules.daysAhead);
  const state = { service: null, date: null, time: null, name: '', phone: '', busy: [], status: 'loading', month: today.slice(0, 7), step: null };

  // ---------- Disponibilidade (uma consulta para todo o período) ----------
  const midnight = (date) => new Date(Date.parse(`${date}T00:00:00Z`) - rules.offset * 60000).toISOString();
  function loadAvailability() {
    state.status = 'loading';
    renderCalendar();
    fetch(`/api/disponibilidade?de=${encodeURIComponent(midnight(today))}&ate=${encodeURIComponent(midnight(addDays(last, 1)))}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        state.busy = data.busy.map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));
        state.status = 'ready';
      })
      .catch(() => {
        state.status = 'error';
      })
      .finally(() => {
        if (state.status === 'ready') pickFirstFreeDay();
        renderCalendar();
      });
  }

  const freeSlots = (date) =>
    state.service && date >= today && date <= last ? slotsForDay(date, state.service.minutes, rules, state.busy, Date.now()) : [];

  function pickFirstFreeDay() {
    if (state.date && freeSlots(state.date).includes(state.time)) return;
    if (state.date && freeSlots(state.date).length) {
      state.time = null;
      return;
    }
    state.date = null;
    state.time = null;
    for (let d = today; d <= last; d = addDays(d, 1)) {
      if (freeSlots(d).length) {
        state.date = d;
        state.month = d.slice(0, 7);
        return;
      }
    }
  }

  // ---------- Calendário ----------
  function renderCalendar() {
    if (!state.service) return;
    const [y, m] = state.month.split('-').map(Number);
    const first = `${state.month}-01`;
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    $('[data-cal-month]').textContent = cap(fmt(first, { month: 'long', year: 'numeric' }));
    $('[data-cal-prev]').disabled = state.month <= today.slice(0, 7);
    $('[data-cal-next]').disabled = state.month >= last.slice(0, 7);

    const cells = Array.from({ length: weekday(first) }, () => '<span class="cal__blank"></span>');
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${state.month}-${String(day).padStart(2, '0')}`;
      const slots = state.status === 'ready' ? freeSlots(date) : [];
      const open = date >= today && date <= last && rules.days.includes(weekday(date));
      const label = `${cap(fmt(date, { weekday: 'long', day: 'numeric', month: 'long' }))}${slots.length ? `, ${slots.length} horários livres` : ', sem horários'}`;
      const cls = ['cal__day', date === today && 'is-today', date === state.date && 'is-selected', open && state.status === 'loading' && 'is-loading']
        .filter(Boolean)
        .join(' ');
      cells.push(
        `<button type="button" class="${cls}" data-date="${date}" aria-label="${label}" aria-pressed="${date === state.date}"${slots.length ? '' : ' disabled'}>${day}</button>`,
      );
    }
    $('[data-cal-grid]').innerHTML = cells.join('');

    const status = $('[data-status]');
    status.innerHTML =
      state.status === 'loading'
        ? 'Carregando horários livres…'
        : state.status === 'error'
          ? `Não foi possível carregar a agenda agora. <button type="button" class="bk-link" data-retry>Tentar de novo</button>`
          : state.date
            ? ''
            : 'Sem horários livres nos próximos dias. Chame no WhatsApp para ver um encaixe.';
    renderSlots();
  }

  function renderSlots() {
    const box = $('[data-slots]');
    const slots = state.status === 'ready' && state.date ? freeSlots(state.date) : [];
    box.innerHTML = slots.length
      ? `<p class="slots__title">Horários livres · ${cap(fmt(state.date, { weekday: 'long', day: '2-digit', month: '2-digit' }))}</p>
         <div class="slots__grid">${slots
           .map((t) => `<button type="button" class="slot" data-time="${t}" aria-pressed="${t === state.time}">${t.replace(':', 'h')}</button>`)
           .join('')}</div>`
      : '';
    $('[data-need-time]').disabled = !(state.date && state.time);
  }

  // ---------- Resumo, Pix e mensagem ----------
  const amount = () => deposit(state.service.price, rules.deposit);
  const percent = Math.round(rules.deposit * 100);

  function summaryRows() {
    const s = state.service;
    return [
      ['Serviço', s.name],
      ['Data', cap(longDate(state.date))],
      ['Horário', `${state.time.replace(':', 'h')} · ${duration(s.minutes)}`],
      ['Valor', money(s.price)],
      [`Sinal (${percent}%)`, moneyCents(amount())],
      ['Nome', state.name],
      ['WhatsApp', phoneMask(state.phone)],
    ];
  }

  const renderSummary = (el) => {
    el.innerHTML = summaryRows()
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)}</dd></div>`)
      .join('');
  };

  function message() {
    return [
      `Olá, ${cfg.firstName}! Fiz um agendamento pelo site.`,
      '',
      ...summaryRows().map(([k, v]) => `${k}: ${v}`),
      '',
      'Segue o comprovante do sinal.',
    ].join('\n');
  }

  const whatsappUrl = () => `https://wa.me/${digits(cfg.whatsapp)}?text=${encodeURIComponent(message())}`;
  let pixCode = '';

  function renderPix() {
    pixCode = pixPayload({ key: cfg.pix.key, name: cfg.pix.holder, city: cfg.pix.city, amount: amount() });
    $('[data-deposit]').textContent = moneyCents(amount());
    $('[data-deposit-note]').textContent = `${percent}% de ${money(state.service.price)} · abatido do valor total`;
    $('[data-qr]').innerHTML = renderSVG(pixCode, { ecc: 'M', border: 2, blackColor: '#3b2a30', whiteColor: '#ffffff' });
    $('[data-qr] svg')?.setAttribute('role', 'img');
    $('[data-qr] svg')?.setAttribute('aria-label', `QR Code do Pix de ${moneyCents(amount())}`);
    updateSend();
  }

  function updateSend() {
    const agreed = $('[data-agree]').checked;
    const send = $('[data-send]');
    send.href = agreed ? whatsappUrl() : '#';
    send.setAttribute('aria-disabled', String(!agreed));
    $('[data-send-again]').href = whatsappUrl();
  }

  // ---------- Etapas ----------
  const ready = {
    servico: () => true,
    data: () => Boolean(state.service),
    dados: () => Boolean(state.service && state.date && state.time),
    revisao: () => Boolean(state.service && state.date && state.time && state.name && state.phone),
  };
  ready.sinal = ready.revisao;
  ready.pronto = ready.revisao;

  function show(step, { push = true, focus = true } = {}) {
    if (!ready[step]()) step = ORDER.slice(0, ORDER.indexOf(step)).reverse().find((s) => ready[s]()) || 'servico';
    state.step = step;
    for (const [name, el] of Object.entries(steps)) el.hidden = name !== step;
    const index = ORDER.indexOf(step);
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-done', i < index);
      if (i === Math.min(index, dots.length - 1)) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });

    if (step === 'data') {
      $('[data-chosen-name]').textContent = state.service.name;
      $('[data-chosen-meta]').textContent = `${duration(state.service.minutes)} · ${money(state.service.price)}`;
      if (state.status === 'ready') pickFirstFreeDay();
      renderCalendar();
    }
    if (step === 'dados') {
      form.elements.nome.value = state.name;
      form.elements.whatsapp.value = phoneMask(state.phone);
    }
    if (step === 'revisao') renderSummary($('[data-summary]'));
    if (step === 'sinal') renderPix();
    if (step === 'pronto') renderSummary($('[data-summary-done]'));

    const url = new URL(location.href);
    if (state.service) url.searchParams.set('servico', state.service.id);
    url.hash = step === 'servico' ? '' : step;
    history[push ? 'pushState' : 'replaceState']({ step }, '', url);

    if (focus) {
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      steps[step].querySelector('.bk-title')?.focus({ preventScroll: true });
    }
  }

  function chooseService(id) {
    const service = cfg.services.find((s) => s.id === id);
    if (!service) return;
    const changed = state.service?.id !== id;
    state.service = service;
    if (changed && state.date && !freeSlots(state.date).includes(state.time)) state.time = null;
    show('data');
  }

  // ---------- Eventos ----------
  root.addEventListener('click', (event) => {
    const t = event.target.closest('button, a');
    if (!t || !root.contains(t)) return;
    if (t.dataset.service) return chooseService(t.dataset.service);
    if (t.dataset.date) {
      state.date = t.dataset.date;
      state.time = null;
      return renderCalendar();
    }
    if (t.dataset.time) {
      state.time = t.dataset.time;
      return renderSlots();
    }
    if (t.matches('[data-cal-prev], [data-cal-next]')) {
      const [y, m] = state.month.split('-').map(Number);
      const d = new Date(Date.UTC(y, m - 1 + (t.matches('[data-cal-next]') ? 1 : -1), 1));
      state.month = d.toISOString().slice(0, 7);
      return renderCalendar();
    }
    if (t.matches('[data-retry]')) return loadAvailability();
    if (t.dataset.copy) {
      const text = t.dataset.copy === 'code' ? pixCode : cfg.pix.key;
      copyText(text).then((ok) => toast.show(ok ? (t.dataset.copy === 'code' ? 'Código Pix copiado!' : 'Chave Pix copiada!') : 'Não foi possível copiar.'));
      return;
    }
    if (t.matches('[data-send]')) {
      if (!$('[data-agree]').checked) {
        event.preventDefault();
        toast.show('Marque que concorda com a política para continuar.');
        $('[data-agree]').focus();
        return;
      }
      // O link abre o WhatsApp; a página mostra a etapa final.
      setTimeout(() => show('pronto'), 300);
      return;
    }
    if (t.dataset.goto) return show(t.dataset.goto);
  });

  $('[data-agree]').addEventListener('change', updateSend);

  form.elements.whatsapp.addEventListener('input', (e) => {
    e.target.value = phoneMask(e.target.value);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.nome.value.trim().replace(/\s+/g, ' ');
    const phone = digits(form.elements.whatsapp.value);
    const error = $('[data-error]');
    const problem = name.length < 2 ? 'Digite seu nome.' : phone.length < 10 || phone.length > 11 ? 'Digite seu WhatsApp com DDD, ex.: (71) 99999-9999.' : '';
    error.hidden = !problem;
    error.textContent = problem;
    if (problem) return (name.length < 2 ? form.elements.nome : form.elements.whatsapp).focus();
    state.name = name;
    state.phone = phone;
    show('revisao');
  });

  window.addEventListener('popstate', (event) => show(event.state?.step || 'servico', { push: false }));

  // ---------- Início ----------
  const params = new URLSearchParams(location.search);
  const initial = cfg.services.find((s) => s.id === params.get('servico'));
  if (initial) state.service = initial;
  show(initial ? 'data' : 'servico', { push: false, focus: false });
  loadAvailability();
}
