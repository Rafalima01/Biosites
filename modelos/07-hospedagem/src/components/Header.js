import { esc, rich } from '../lib/html.js';
import { icon, logoMark } from './icons.js';
import { Picture } from './Picture.js';

export const Topbar = (site) => `<header class="topbar">
  <a class="topbar__brand" href="#inicio" data-scroll>
    ${logoMark(34)}
    <span><strong>${esc(site.brand.name)}</strong><small>${esc(site.brand.tagline)}</small></span>
  </a>
  <a class="btn btn--primary btn--sm" href="#agenda" data-scroll>Reservar</a>
</header>`;

export function Hero(site) {
  const { hero } = site;
  const stats = hero.stats
    .map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`)
    .join('');
  return `<section class="hero" id="inicio">
  <div class="hero__media">
    ${Picture(hero.photo, { className: 'hero__img', priority: true, sizes: '(min-width: 960px) 1100px, 100vw' })}
  </div>
  <div class="hero__content">
    <p class="hero__badge">${icon('tag', { size: 16 })}${esc(hero.badge)}</p>
    <p class="hero__eyebrow">${esc(hero.eyebrow)}</p>
    <h1 class="hero__title">${rich(hero.title)}</h1>
    <p class="hero__text">${esc(hero.text)}</p>
    <ul class="hero__stats" aria-label="Números">${stats}</ul>
  </div>
</section>
<a class="search reveal" href="#agenda" data-scroll data-search>
  <span class="search__icon">${icon('search', { size: 20 })}</span>
  <span class="search__text">
    <strong>Quando você vai?</strong>
    <span data-search-summary>Escolha a casa, as datas e os hóspedes</span>
  </span>
  <span class="search__go" aria-hidden="true">${icon('arrowRight', { size: 18 })}</span>
</a>`;
}

const TABS = [
  { id: 'casas', label: 'Casas', icon: 'home' },
  { id: 'pacotes', label: 'Pacotes', icon: 'box' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar' },
  { id: 'duvidas', label: 'Dúvidas', icon: 'help' },
];

export const Tabs = () => `<nav class="tabs" aria-label="Seções" data-tabs>
  ${TABS.map((t) => `<a class="tabs__item" href="#${t.id}" data-scroll>${icon(t.icon, { size: 22 })}<span>${t.label}</span></a>`).join('')}
</nav>`;
