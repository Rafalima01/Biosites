import { esc, slug } from '../lib/html.js';
import { resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';

const duration = (m) => (m % 60 === 0 ? `${m / 60} h` : m > 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
const money = (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const STEPS = [
  ['servico', 'Serviço'],
  ['data', 'Data'],
  ['dados', 'Dados'],
  ['revisao', 'Revisão'],
  ['sinal', 'Sinal'],
];

/** Dados que o navegador usa para montar o calendário, o Pix e a mensagem (behaviors/booking.js). */
export const bookingData = (site) => ({
  whatsapp: site.contact.whatsapp.number,
  firstName: site.brand.firstName,
  rules: site.booking,
  pix: site.pix,
  // Sistema de Agendamento (chave pública "anon"). Sem ele, a página usa a agenda do Google.
  sistema: site.sistema?.url ? site.sistema : null,
  services: site.services.flatMap((g) =>
    g.items.map((s) => ({ id: slug(s.name), name: s.name, category: g.category, minutes: s.minutes, price: s.price })),
  ),
});

const backBtn = (to) => `<button type="button" class="bk-btn bk-btn--ghost" data-goto="${to}">${icon('arrowLeft', { size: 16 })}<span>Voltar</span></button>`;

/** Página /agendar/: as etapas ficam escondidas e o navegador mostra uma por vez. */
export function Booking(site) {
  const p = site.pages.agendar;
  const { pix, policy } = site;
  const whatsapp = resolveChannel(site, 'whatsapp', { message: `Olá, ${site.brand.firstName}! Vim pelo seu site e quero agendar um horário.` });
  const data = JSON.stringify(bookingData(site)).replace(/</g, '\\u003c');

  const groups = site.services
    .map(
      (g) => `<div class="bk-group">
        <p class="bk-group__title">${esc(g.category)}</p>
        <ul class="bk-options">${g.items
          .map(
            (s) => `<li><button type="button" class="bk-option" data-service="${esc(slug(s.name))}">
            <span class="bk-option__text"><span class="bk-option__name">${esc(s.name)}</span><span class="bk-option__meta">${duration(s.minutes)} · ${money(s.price)}</span></span>
            ${icon('chevronRight', { size: 18 })}
          </button></li>`,
          )
          .join('')}</ul>
      </div>`,
    )
    .join('');

  const dots = STEPS.map(([id, label], i) => `<li data-dot="${id}"><span class="bk-steps__n">${i + 1}</span><span class="bk-steps__label">${esc(label)}</span></li>`).join('');

  return `<section class="booking" data-booking aria-labelledby="booking-title">
    <script type="application/json" data-booking-config>${data}</script>
    <header class="services__head reveal">
      <span class="signature services__signature" aria-hidden="true">${esc(site.brand.signature)}</span>
      <h1 class="title" id="booking-title">${esc(p.title)} <em>${esc(p.titleAccent)}</em></h1>
      <p class="services__sub">${esc(p.subtitle)}</p>
    </header>

    <ol class="bk-steps" aria-label="Etapas do agendamento">${dots}</ol>

    <noscript><p class="bk-card bk-lead">Para ver os horários livres, ative o JavaScript do navegador ou ${renderTarget(whatsapp, { className: 'bk-link', label: 'WhatsApp', content: 'chame no WhatsApp' })}.</p></noscript>

    <div class="bk-card" data-step="servico" hidden>
      <h2 class="bk-title" tabindex="-1">Escolha o serviço</h2>
      <div class="bk-groups">${groups}</div>
    </div>

    <div class="bk-card" data-step="data" hidden>
      <div class="bk-chosen">
        <p><span class="bk-chosen__label">Serviço</span><strong data-chosen-name></strong><span data-chosen-meta></span></p>
        <button type="button" class="bk-link" data-goto="servico">Trocar</button>
      </div>
      <h2 class="bk-title" tabindex="-1">Escolha o dia e o horário</h2>
      <div class="cal">
        <div class="cal__head">
          <button type="button" class="cal__nav" data-cal-prev aria-label="Mês anterior">${icon('arrowLeft', { size: 18 })}</button>
          <p class="cal__month" data-cal-month aria-live="polite"></p>
          <button type="button" class="cal__nav cal__nav--next" data-cal-next aria-label="Próximo mês">${icon('arrowLeft', { size: 18 })}</button>
        </div>
        <div class="cal__week" aria-hidden="true"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>
        <div class="cal__grid" data-cal-grid></div>
      </div>
      <p class="bk-status" data-status role="status"></p>
      <div class="slots" data-slots></div>
      <div class="bk-actions">
        <button type="button" class="bk-btn" data-goto="dados" data-need-time disabled>Continuar</button>
      </div>
    </div>

    <form class="bk-card" data-step="dados" hidden novalidate>
      <h2 class="bk-title" tabindex="-1">Seus dados</h2>
      ${site.sistema?.url ? '<p class="bk-lead" data-dados-lead>Digite seu WhatsApp. Se você já agendou aqui antes, a gente te reconhece.</p>' : ''}
      <label class="field">
        <span class="field__label">WhatsApp com DDD</span>
        <input class="field__input" name="whatsapp" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="(71) 99999-9999" required>
      </label>
      <p class="bk-welcome" data-welcome role="status" hidden></p>
      <label class="field" data-name-field${site.sistema?.url ? ' hidden' : ''}>
        <span class="field__label">Nome e sobrenome</span>
        <input class="field__input" name="nome" autocomplete="name">
      </label>
      <p class="field__error" data-error role="alert" hidden></p>
      <div class="bk-actions">
        ${backBtn('data')}
        <button type="submit" class="bk-btn">Continuar</button>
      </div>
    </form>

    <div class="bk-card" data-step="revisao" hidden>
      <h2 class="bk-title" tabindex="-1">Revise seu agendamento</h2>
      <dl class="bk-summary" data-summary></dl>
      <p class="bk-note">Confira se está tudo certo. Na próxima etapa você envia o sinal de ${Math.round(site.booking.deposit * 100)}% para garantir o horário.</p>
      <div class="bk-actions">
        ${backBtn('dados')}
        <button type="button" class="bk-btn" data-goto="sinal">Confirmar</button>
      </div>
    </div>

    <div class="bk-card" data-step="sinal" hidden>
      <h2 class="bk-title" tabindex="-1">Sinal de ${Math.round(site.booking.deposit * 100)}%</h2>
      <p class="bk-lead">Para confirmar o agendamento, envie o sinal pelo Pix e mande o comprovante pelo WhatsApp.</p>
      <div class="pix">
        <p class="pix__amount"><span>Valor do sinal</span><strong data-deposit></strong><small data-deposit-note></small></p>
        <div class="pix__qr" data-qr></div>
        <button type="button" class="bk-btn bk-btn--soft" data-copy="code">Copiar Pix copia e cola</button>
        <p class="pix__key">Chave Pix (${esc(pix.keyLabel.toLowerCase())}): <strong>${esc(pix.keyDisplay)}</strong>
          <button type="button" class="bk-link" data-copy="key">Copiar chave</button></p>
        <p class="pix__holder">Em nome de ${esc(pix.holder)}</p>
      </div>
      <div class="policy">
        <h3 class="policy__title">${esc(policy.title)}</h3>
        ${policy.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('')}
        <p class="policy__sign">${esc(policy.signature)}</p>
      </div>
      <label class="check">
        <input type="checkbox" data-agree>
        <span>${esc(policy.agree)}</span>
      </label>
      <a class="bk-btn bk-btn--send" data-send href="#" target="_blank" rel="noopener noreferrer" aria-disabled="true">${icon('whatsapp', { size: 20 })}<span>Agendar e enviar comprovante</span></a>
      <p class="bk-note">O WhatsApp abre com a mensagem pronta. Anexe o comprovante do Pix na conversa.</p>
      <div class="bk-actions">${backBtn('revisao')}</div>
    </div>

    <div class="bk-card bk-done" data-step="pronto" hidden>
      <span class="bk-done__icon">${icon('check', { size: 34, stroke: 1.4 })}</span>
      <h2 class="bk-title" tabindex="-1">Agora é só enviar o comprovante</h2>
      <p class="bk-lead">Anexe o comprovante do Pix na conversa do WhatsApp. Seu horário fica garantido quando ${esc(site.brand.firstName)} confirmar.</p>
      <dl class="bk-summary" data-summary-done></dl>
      <a class="bk-btn bk-btn--send" data-send-again href="#" target="_blank" rel="noopener noreferrer">${icon('whatsapp', { size: 20 })}<span>Abrir o WhatsApp de novo</span></a>
      <a class="bk-link bk-done__home" href="/">Voltar ao início</a>
    </div>
  </section>`;
}
