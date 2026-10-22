import { esc } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';

function LinkCard(site, card, index) {
  const target = resolveAction(site, card.action);
  const content = `
      <span class="link-card__icon" aria-hidden="true">${icon(card.icon, { size: 26, stroke: 1.4 })}</span>
      <span class="link-card__body">
        <span class="link-card__title">${esc(card.title)}</span>
        <span class="link-card__desc">${esc(card.description)}</span>
      </span>
      <span class="link-card__arrow" aria-hidden="true">${icon('chevronRight', { size: 18, stroke: 1.6 })}</span>`;
  return `<li class="reveal" style="--i:${index}">${renderTarget(target, {
    className: 'link-card',
    label: card.title,
    content,
    extra: { 'data-card': card.id },
  })}</li>`;
}

export const LinkCards = (site) =>
  `<nav class="link-cards" aria-label="Navegação principal">
    <ul class="link-cards__list">${site.cards.map((card, i) => LinkCard(site, card, i)).join('')}</ul>
  </nav>`;
