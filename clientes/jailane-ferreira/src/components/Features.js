import { esc } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { Picture } from './Picture.js';

function Feature(site, item, index) {
  const target = resolveAction(site, item.action);
  const content = `
      <span class="feature__body">
        <span class="feature__title">${esc(item.title)}</span>
        <span class="feature__desc">${esc(item.description)}</span>
        <span class="pill pill--sm feature__cta" aria-hidden="true">${esc(item.cta)}</span>
      </span>
      <span class="feature__media">${Picture(item.photo, { sizes: '(min-width: 960px) 360px, 40vw' })}</span>`;
  return `<li class="reveal" style="--i:${index}">${renderTarget(target, {
    className: `feature feature--${item.tone === 'dark' ? 'dark' : 'light'}`,
    label: item.title,
    content,
    extra: { 'data-card': item.id },
  })}</li>`;
}

export const Features = (site) =>
  `<nav class="features" aria-label="Navegação principal">
    <ul class="features__list">${site.features.map((f, i) => Feature(site, f, i)).join('')}</ul>
  </nav>`;
