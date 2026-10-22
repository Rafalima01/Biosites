import { esc, attrs } from '../lib/html.js';
import { T, attrI18n } from '../lib/i18n.js';
import { icon } from './icons.js';
import { Lockup } from './Brand.js';

// Bandeiras em SVG (emojis de bandeira não aparecem no Windows).
const FLAGS = {
  pt: `<svg class="lang__flag" viewBox="0 0 28 20" aria-hidden="true" focusable="false"><rect width="28" height="20" rx="3" fill="#169b3c"/><path d="M14 3l10 7-10 7L4 10z" fill="#ffd400"/><circle cx="14" cy="10" r="4" fill="#1d3f99"/></svg>`,
  en: `<svg class="lang__flag" viewBox="0 0 28 20" aria-hidden="true" focusable="false"><rect width="28" height="20" rx="3" fill="#fff"/><path d="M0 1.5h28M0 4.6h28M0 7.7h28M0 10.8h28M0 13.9h28M0 17h28" stroke="#d22630" stroke-width="1.55"/><rect width="12.5" height="10.8" rx="2" fill="#1f3a8a"/></svg>`,
};

/**
 * Barra superior: marca, seletor de idioma e alternância de tema.
 * Em páginas internas (`back`), mostra também o botão de voltar para a página inicial.
 */
export const Header = (site, { back = false } = {}) =>
  `<div class="topbar${back ? ' topbar--inner' : ''}">
    <div class="topbar__start">
      ${back ? `<a class="back" href="/" ${attrs(attrI18n('aria-label', site.portfolioPage.back))}>${icon('arrowLeft', { size: 18, stroke: 2 })}<span class="back__label">${T(site.portfolioPage.back)}</span></a>` : ''}
      <a class="topbar__brand" href="${back ? '/' : '#topo'}" aria-label="${esc(site.brand.name)}">${Lockup(site)}</a>
    </div>
    <div class="topbar__controls">
      <div class="lang" role="group" aria-label="Idioma / Language">
        <button type="button" class="lang__btn" data-lang="pt" aria-pressed="true">${FLAGS.pt}PT</button>
        <button type="button" class="lang__btn" data-lang="en" aria-pressed="false">${FLAGS.en}EN</button>
      </div>
      <button type="button" class="theme-toggle" data-theme-toggle aria-label="Alternar tema claro/escuro">
        <span class="theme-toggle__sun">${icon('sun', { size: 20 })}</span>
        <span class="theme-toggle__moon">${icon('moon', { size: 20 })}</span>
      </button>
    </div>
  </div>`;
