import { esc } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { Picture } from './Picture.js';

const LAYOUTS = new Set(['photo-left', 'photo-right', 'texture']);

function Banner(site, item, index) {
  const layout = LAYOUTS.has(item.layout) ? item.layout : 'photo-left';
  const target = resolveAction(site, item.action);
  const content = `
      <span class="banner__media" aria-hidden="true">${Picture({ ...item.photo, alt: '' }, { sizes: '(min-width: 960px) 360px, 100vw' })}</span>
      <span class="banner__body">
        <span class="banner__title">${esc(item.title)}</span>
        ${item.subtitle ? `<span class="banner__subtitle">${esc(item.subtitle)}</span>` : ''}
        ${item.cta ? `<span class="banner__cta" aria-hidden="true">${esc(item.cta)}</span>` : ''}
      </span>`;
  return `<li class="reveal" style="--i:${index}">${renderTarget(target, {
    className: `banner banner--${layout}${item.flip ? ' banner--flip' : ''}`,
    label: item.title,
    content,
    extra: { 'data-card': item.id },
  })}</li>`;
}

export const Banners = (site) =>
  `<nav class="banners" aria-label="Navegação principal">
    <ul class="banners__list">${site.banners.map((b, i) => Banner(site, b, i)).join('')}</ul>
  </nav>`;
