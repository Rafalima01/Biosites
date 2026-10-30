// Agendamento online: serviço → dia e horário livres → dados → revisão → sinal por Pix → WhatsApp.
//
// Com o Sistema de Agendamento ligado (`cfg.sistema`): os horários vêm do sistema (expediente,
// bloqueios e agendamentos do painel) e, ao enviar, o agendamento é GRAVADO no sistema (aparece no
// painel em "Aguardando sinal" e segura o horário) antes de abrir o WhatsApp com o comprovante.
// Sem o sistema: os ocupados vêm da agenda do Google (/api/disponibilidade) e nada é gravado.
import { renderSVG } from 'uqr';
import { pixPayload } from '../lib/pix.js';
import { addDays, daySlots, deposit, localDate, slotsForDay, weekday } from '../lib/agenda.js';
import { carregarStudio, horariosDoDia, ligarServicos, reservar, resumoDias } from '../lib/sistema.js';

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
  const state = {
    service: null, date: null, time: null, name: '', phone: '', busy: [], status: 'loading', month: today.slice(0, 7), step: null,
    summary: {}, slots: {}, code: '', sending: false,
  };
  const sis = cfg.sistema && cfg.sistema.url ? cfg.sistema : null;
  let studioPronto = null; // carrega os serviços do sistema uma vez

  // ---------- Disponibilidade ----------
  const midnight = (date) => new Date(Date.parse(`${date}T00:00:00Z`) - rules.offset * 60000).toISOString();
  function loadAvailability() {
    state.status = 'loading';
    renderCalendar();
    if (sis) return loadFromSystem();
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

  // Sistema: resumo de dias livres do serviço escolhido e, depois, os horários do dia selecionado.
  async function loadFromSystem() {
    try {
      studioPronto ??= carregarStudio(sis).then((st) => {
        cfg.services = ligarServicos(cfg.services, st.services || []);
        if (state.service) state.service = cfg.services.find((s) => s.id === state.service.id) || state.service;
      });
      await studioPronto;
      if (!state.service) {
        state.status = 'ready';
        return;
      }
      if (!state.service.uuid) throw new Error('Serviço sem cadastro no sistema');
      state.summary = await resumoDias(sis, state.service.uuid, today, last);
      state.slots = {};
      state.status = 'ready';
      pickFirstFreeDay();
      if (state.date) await loadDay(state.date);
      if (state.time && !freeSlots(state.date).includes(state.time)) state.time = null;
    } catch {
      state.status = 'error';
    }
    renderCalendar();
  }

  async function loadDay(date) {
    if (!sis || !state.service?.uuid) return;
    state.slots[date] = await horariosDoDia(sis, state.service.uuid, date);
  }

  const freeSlots = (date) => {
    if (!state.service || date < today || date > last) return [];
    if (sis) return (state.slots[date] || []).filter((s) => s.free).map((s) => s.time);
    return slotsForDay(date, state.service.minutes, rules, state.busy, Date.now());
  };
  /** O dia tem horário livre? (no sistema, vem do resumo; o dia escolhido é conferido na lista completa) */
  const dayHasFree = (date) => (sis ? (state.summary[date] || 0) > 0 : freeSlots(date).length > 0);
  const dayFreeCount = (date) => (sis ? state.summary[date] || 0 : freeSlots(date).length);

  function pickFirstFreeDay() {
    if (state.date && dayHasFree(state.date)) {
      // No sistema, o horário escolhido é conferido quando a lista do dia chega (loadFromSystem).
      if (!sis && !freeSlots(state.date).includes(state.time)) state.time = null;
      return;
    }
    state.date = null;
    state.time = null;
    for (let d = today; d <= last; d = addDays(d, 1)) {
      if (dayHasFree(d)) {
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
      const livres = state.status === 'ready' ? dayFreeCount(date) : 0;
      const open = date >= today && date <= last && rules.days.includes(weekday(date));
      const label = `${cap(fmt(date, { weekday: 'long', day: 'numeric', month: 'long' }))}${livres ? `, ${livres} horários livres` : ', sem horários'}`;
      const cls = ['cal__day', date === today && 'is-today', date === state.date && 'is-selected', open && state.status === 'loading' && 'is-loading']
        .filter(Boolean)
        .join(' ');
      cells.push(
        `<button type="button" class="${cls}" data-date="${date}" aria-label="${label}" aria-pressed="${date === state.date}"${livres ? '' : ' disabled'}>${day}</button>`,
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

  // Ocupados aparecem riscados e sem clique, para a cliente ver que o horário existe mas já foi reservado.
  function renderSlots() {
    const box = $('[data-slots]');
    const slots =
      state.status === 'ready' && state.date
        ? sis
          ? state.slots[state.date] || []
          : daySlots(state.date, state.service.minutes, rules, state.busy, Date.now())
        : [];
    if (sis && state.status === 'ready' && state.date && !state.slots[state.date]) {
      box.innerHTML = '<p class="slots__title">Carregando horários…</p>';
      $('[data-need-time]').disabled = true;
      return;
    }
    const hasBusy = slots.some((s) => !s.free);
    box.innerHTML = slots.length
      ? `<p class="slots__title">Horários · ${cap(fmt(state.date, { weekday: 'long', day: '2-digit', month: '2-digit' }))}</p>
         <div class="slots__grid">${slots
           .map(({ time, free }) => {
             const label = time.replace(':', 'h');
             return free
               ? `<button type="button" class="slot" data-time="${time}" aria-pressed="${time === state.time}">${label}</button>`
               : `<button type="button" class="slot is-busy" disabled aria-label="${label}, ocupado">${label}</button>`;
           })
           .join('')}</div>
         ${hasBusy ? '<p class="slots__legend"><span class="slots__legend-mark" aria-hidden="true">00h00</span>Riscado: horário já ocupado</p>' : ''}`
      : '';
    $('[data-need-time]').disabled = !(state.date && state.time);
  }

  // ---------- Resumo, Pix e mensagem ----------
  const amount = () => deposit(state.service.price, rules.deposit);
  const percent = Math.round(rules.deposit * 100);

  function summaryRows() {
    const s = state.service;
    return [
      ...(state.code ? [['Código', state.code]] : []),
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

  // A mensagem já sai do WhatsApp da cliente: o número dela não precisa ir no texto.
  function message() {
    return [
      `Olá, ${cfg.firstName}! Fiz um agendamento pelo site.`,
      '',
      ...summaryRows()
        .filter(([k]) => k !== 'WhatsApp')
        .map(([k, v]) => `${k}: ${v}`),
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
      form.elements.nome.value = state.known ? '' : state.name;
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
    state.code = '';
    if (sis) {
      // Cada serviço tem duração própria: o sistema recalcula os dias e horários livres.
      if (changed) state.time = null;
      show('data');
      if (changed || state.status !== 'ready') loadAvailability();
      return;
    }
    if (changed && state.date && !freeSlots(state.date).includes(state.time)) state.time = null;
    show('data');
  }

  // Grava o agendamento no sistema (aguardando sinal) e só então abre o WhatsApp com o código.
  async function enviarPeloSistema() {
    if (state.sending) return;
    const slot = (state.slots[state.date] || []).find((s) => s.time === state.time);
    if (!slot) {
      toast.show('Escolha o horário de novo, por favor.');
      return show('data');
    }
    state.sending = true;
    const send = $('[data-send]');
    const textoBotao = send.querySelector('span').textContent;
    send.querySelector('span').textContent = 'Reservando seu horário…';
    send.setAttribute('aria-disabled', 'true');
    // Abre a aba já no clique (o navegador bloqueia janelas abertas depois de uma espera).
    const aba = window.open('', '_blank');
    try {
      const r = await reservar(sis, {
        uuid: state.service.uuid,
        startsAt: slot.startsAt,
        name: state.known ? '' : state.name,
        phone: phoneMask(state.phone),
        birthDay: state.known ? null : state.birthDay,
        birthMonth: state.known ? null : state.birthMonth,
      });
      if (!r.ok && r.needName) {
        aba?.close();
        toast.show('Precisamos do seu nome e sobrenome para o cadastro.');
        state.known = false;
        conhecida = null;
        consultado = state.phone;
        mostrarCadastro(true);
        show('dados');
        return;
      }
      if (!r.ok) {
        aba?.close();
        toast.show(r.reason || 'Não foi possível reservar esse horário.');
        state.time = null;
        loadAvailability();
        show('data');
        return;
      }
      state.code = r.code;
      const url = whatsappUrl();
      if (aba) aba.location.href = url;
      else location.href = url;
      show('pronto');
    } catch {
      aba?.close();
      toast.show('Sem conexão com a agenda agora. Tente de novo em instantes.');
    } finally {
      state.sending = false;
      send.querySelector('span').textContent = textoBotao;
      updateSend();
    }
  }

  // ---------- Eventos ----------
  root.addEventListener('click', (event) => {
    const t = event.target.closest('button, a');
    if (!t || !root.contains(t)) return;
    if (t.dataset.service) return chooseService(t.dataset.service);
    if (t.dataset.date) {
      state.date = t.dataset.date;
      state.time = null;
      renderCalendar();
      if (sis && !state.slots[state.date]) {
        const dia = state.date;
        loadDay(dia)
          .catch(() => toast.show('Não foi possível carregar os horários desse dia.'))
          .finally(() => state.date === dia && renderSlots());
      }
      return;
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
      if (sis) {
        event.preventDefault();
        enviarPeloSistema();
        return;
      }
      // O link abre o WhatsApp; a página mostra a etapa final.
      setTimeout(() => show('pronto'), 300);
      return;
    }
    if (t.dataset.goto) return show(t.dataset.goto);
  });

  $('[data-agree]').addEventListener('change', updateSend);

  // Com o sistema: cliente cadastrada é reconhecida pelo WhatsApp; cliente nova informa o nome.
  const nameField = $('[data-name-field]');
  const birthField = $('[data-birth-field]'); // aniversário (só com o sistema, só cliente nova)
  const mostrarCadastro = (sim) => {
    nameField.hidden = !sim;
    if (birthField) birthField.hidden = !sim;
  };
  const welcome = $('[data-welcome]');
  let conhecida = null; // { phone, firstName } quando o número já tem cadastro
  let consultado = ''; // último número consultado

  form.elements.whatsapp.addEventListener('input', (e) => {
    e.target.value = phoneMask(e.target.value);
    if (sis && digits(e.target.value) !== consultado) {
      conhecida = null;
      welcome.hidden = true;
      if (consultado) mostrarCadastro(false);
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = form.elements.nome.value.trim().replace(/\s+/g, ' ');
    const phone = digits(form.elements.whatsapp.value);
    const error = $('[data-error]');
    const erro = (msg, campo) => {
      error.hidden = !msg;
      error.textContent = msg || '';
      if (msg) campo?.focus();
      return Boolean(msg);
    };
    if (erro(phone.length < 10 || phone.length > 11 ? 'Digite seu WhatsApp com DDD, ex.: (71) 99999-9999.' : '', form.elements.whatsapp)) return;

    if (sis) {
      if (consultado !== phone) {
        const botao = form.querySelector('[type="submit"]');
        botao.disabled = true;
        try {
          const r = await fetch(`${sis.url}/rest/v1/rpc/find_client`, {
            method: 'POST',
            headers: { apikey: sis.chave, Authorization: `Bearer ${sis.chave}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ p_slug: sis.studio, p_phone: phone }),
          }).then((x) => x.json());
          consultado = phone;
          conhecida = r.found ? { phone, firstName: r.firstName } : null;
        } catch {
          botao.disabled = false;
          return erro('Não foi possível verificar agora. Tente de novo.', form.elements.whatsapp);
        }
        botao.disabled = false;
      }
      if (conhecida) {
        welcome.hidden = false;
        welcome.textContent = `Que bom te ver de novo, ${conhecida.firstName}! 💜`;
        mostrarCadastro(false);
        erro('');
        state.name = conhecida.firstName;
        state.phone = phone;
        state.known = true;
        return show('revisao');
      }
      if (nameField.hidden) {
        mostrarCadastro(true);
        welcome.hidden = false;
        welcome.textContent = 'Primeira vez por aqui? Digite seu nome, sobrenome e aniversário para fazer seu cadastro.';
        erro('');
        return form.elements.nome.focus();
      }
    }

    if (erro(!/^\S{2,}(\s+\S+)+$/.test(name) ? 'Digite seu nome e sobrenome.' : '', form.elements.nome)) return;
    if (sis && birthField) {
      const dia = Number(form.elements.niver_dia.value);
      const mes = Number(form.elements.niver_mes.value);
      const ultimo = new Date(Date.UTC(2000, mes, 0)).getUTCDate(); // 2000: fevereiro com 29
      if (erro(!dia || !mes ? 'Escolha o dia e o mês do seu aniversário.' : dia > ultimo ? 'Confira a data do seu aniversário.' : '', form.elements.niver_dia)) return;
      state.birthDay = dia;
      state.birthMonth = mes;
    }
    state.name = name;
    state.phone = phone;
    state.known = false;
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
