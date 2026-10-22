import { esc } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';

const TONES = new Set(['red', 'yellow', 'dark', 'green']);

/** Substitui {address} e {whatsapp} pelos dados de `contact` (ou por um aviso, se vazios). */
function fillText(site, text = '') {
  const { address } = site.contact.location;
  const digits = site.contact.whatsapp.number.replace(/\D/g, '');
  const phone = digits.length >= 12 ? `(${digits.slice(2, 4)}) ${digits.slice(4, -4)}-${digits.slice(-4)} · ` : '';
  return text.replace('{address}', address || 'Endereço da unidade (a configurar)').replace('{whatsapp}', phone);
}

function LinkCard(site, item, index) {
  const tone = TONES.has(item.tone) ? item.tone : 'dark';
  const target = resolveAction(site, item.action);
  const text = fillText(site, item.text);
  const content = `
      <span class="order__icon" aria-hidden="true">${icon(item.icon, { size: 26, stroke: 1.8 })}</span>
      <span class="order__body">
        <span class="order__eyebrow">${esc(item.eyebrow)}</span>
        <span class="order__title">${esc(item.title)}</span>
        ${text ? `<span class="order__text">${esc(text)}</span>` : ''}
        ${item.hint ? `<span class="order__hint">${esc(item.hint)}</span>` : ''}
      </span>
      <span class="order__arrow" aria-hidden="true">${icon('arrowRight', { size: 18, stroke: 2 })}</span>`;
  return `<li class="reveal" style="--i:${index}">${renderTarget(target, {
    className: `order order--${tone}`,
    label: item.eyebrow,
    content,
    extra: { 'data-card': item.id },
  })}</li>`;
}

export const LinkCards = (site) =>
  `<nav class="orders" aria-label="Pedidos e contato">
    <ul class="orders__list">${site.links.map((l, i) => LinkCard(site, l, i)).join('')}</ul>
  </nav>`;
