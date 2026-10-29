import { esc, attrs } from '../lib/html.js';
import { brl } from '../lib/pricing.js';
import { icon } from './icons.js';

/** Dados que o navegador precisa para montar a agenda e o orçamento. */
const bookingData = (site) =>
  JSON.stringify({
    houses: site.houses.map(({ id, name, guests, price, weekendPrice, cleaningFee, minNights, bookings }) => ({
      id, name, guests, price, weekendPrice, cleaningFee, minNights, bookings,
    })),
    packages: (site.packages || []).map(({ id, tag, title, house, from, to }) => ({ id, tag, title, house, from, to })),
    seasons: site.seasons || [],
    platformFee: site.platformFee || 0,
    whatsapp: site.contact.whatsapp.number || '',
    demo: Boolean(site.demo),
  }).replace(/</g, '\\u003c');

const LEGEND = [
  ['free', 'Disponível'],
  ['high', 'Fim de semana / temporada'],
  ['package', 'Pacote'],
  ['booked', 'Ocupado'],
];

export const Booking = (site) => `<section class="section booking" id="agenda" aria-labelledby="agenda-title">
  <div class="section__head">
    <p class="eyebrow">Agenda e disponibilidade</p>
    <h2 class="section__title" id="agenda-title">Planeje sua estadia</h2>
    <p class="section__lead">Toque na data de entrada e depois na de saída. O valor aparece na hora.</p>
  </div>

  <div class="booking__grid" data-booking>
    <div class="calendar-card">
      <div class="house-picker" role="radiogroup" aria-label="Casa">
        ${site.houses
          .map(
            (h, i) => `<button ${attrs({ type: 'button', class: 'chip', role: 'radio', 'aria-checked': i === 0 ? 'true' : 'false', 'data-house': h.id })}>${esc(h.name)}</button>`,
          )
          .join('')}
      </div>
      <div class="calendar__nav">
        <button class="icon-btn" type="button" data-month="-1" aria-label="Mês anterior">${icon('chevronLeft', { size: 20 })}</button>
        <p class="calendar__month" data-month-label aria-live="polite"></p>
        <button class="icon-btn" type="button" data-month="1" aria-label="Próximo mês">${icon('chevronRight', { size: 20 })}</button>
      </div>
      <div class="calendar" data-calendar>
        <noscript><p class="calendar__fallback">Ative o JavaScript para ver a agenda ou fale conosco pelo WhatsApp.</p></noscript>
      </div>
      <ul class="legend">${LEGEND.map(([k, l]) => `<li><span class="legend__dot legend__dot--${k}"></span>${l}</li>`).join('')}</ul>
    </div>

    <aside class="summary" aria-labelledby="summary-title">
      <h3 class="summary__title" id="summary-title">Sua reserva</h3>
      <p class="summary__house" data-summary-house>${esc(site.houses[0].name)}</p>
      <div class="summary__dates">
        <div><span>Entrada</span><strong data-checkin>Escolha</strong></div>
        <div><span>Saída</span><strong data-checkout>Escolha</strong></div>
      </div>
      <div class="stepper">
        <span>Hóspedes</span>
        <div class="stepper__ctrl">
          <button class="icon-btn" type="button" data-guests="-1" aria-label="Menos hóspedes">${icon('minus', { size: 18 })}</button>
          <output data-guests-value aria-live="polite">2</output>
          <button class="icon-btn" type="button" data-guests="1" aria-label="Mais hóspedes">${icon('plus', { size: 18 })}</button>
        </div>
      </div>
      <dl class="breakdown" data-breakdown hidden>
        <div><dt data-lodging-label></dt><dd data-lodging></dd></div>
        <div><dt>Taxa de limpeza</dt><dd data-cleaning></dd></div>
        <div class="breakdown__total"><dt>Total estimado</dt><dd data-total></dd></div>
      </dl>
      <p class="savings" data-savings hidden>${icon('tag', { size: 16 })}<span></span></p>
      <p class="summary__hint" data-hint>A partir de ${brl(site.houses[0].price)}/noite · mínimo de ${site.houses[0].minNights || 1} noites</p>
      <button class="btn btn--primary btn--block" type="button" data-book>${icon('whatsapp', { size: 20 })}Solicitar reserva</button>
      <p class="summary__note">Sem cobrança agora. Confirmamos a disponibilidade pelo WhatsApp.</p>
    </aside>
  </div>
  <script type="application/json" id="booking-data">${bookingData(site)}</script>
</section>`;

export const BottomBar = (site) => `<div class="bottombar" data-bottombar>
  <p class="bottombar__info" data-bar-info><span>A partir de</span><strong>${brl(Math.min(...site.houses.map((h) => h.price)))}<small>/noite</small></strong></p>
  <button class="btn btn--primary" type="button" data-bar-cta>Ver datas</button>
</div>`;

/** Só no modo demonstrativo sem WhatsApp: mostra a mensagem que seria enviada. */
export const DemoDialog = () => `<dialog class="sheet sheet--small" id="demo-message" aria-labelledby="demo-message-title">
  <div class="sheet__panel">
    <button class="sheet__close" type="button" data-close aria-label="Fechar">${icon('close', { size: 20 })}</button>
    <div class="sheet__body">
      <p class="eyebrow">Modelo demonstrativo</p>
      <h2 class="sheet__title" id="demo-message-title">Esta mensagem iria para o WhatsApp</h2>
      <pre class="wa-preview" data-demo-text></pre>
      <p class="sheet__text">Com o número do anfitrião configurado, o botão abre a conversa já com esse texto.</p>
    </div>
  </div>
</dialog>`;
