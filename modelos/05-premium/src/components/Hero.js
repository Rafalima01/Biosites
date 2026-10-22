import { esc, rich } from '../lib/html.js';
import { Picture } from './Picture.js';

/** Linhas curvas douradas que atravessam a capa (decorativas). */
const swirls = `<svg class="hero__swirls" viewBox="0 0 400 480" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="gold-line" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="var(--gold-light)"/>
      <stop offset=".5" stop-color="var(--gold)"/>
      <stop offset="1" stop-color="var(--gold-dark)"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke="url(#gold-line)" stroke-linecap="round">
    <path d="M-20 70C60 20 170 10 250 40s120 90 170 60" stroke-width="5"/>
    <path d="M-10 150c60-70 150-90 210-40 70 58 30 160-60 170C50 290 20 200 70 160" stroke-width="2.2" opacity=".85"/>
    <path d="M10 420c20-110 90-180 170-200" stroke-width="1.4" opacity=".7"/>
    <path d="M300 -10c20 60 10 110-30 150" stroke-width="3" opacity=".8"/>
  </g>
</svg>`;

export function Hero({ brand, hero }) {
  return `<header class="hero">
    <span class="hero__backdrop" aria-hidden="true"></span>
    ${swirls}
    <figure class="hero__media">
      ${Picture(hero.photo, { className: 'hero__photo', sizes: '(min-width: 960px) 46vw, 62vw', priority: true })}
    </figure>
    <div class="hero__text">
      <p class="hero__greeting reveal">${esc(brand.greeting)}</p>
      <h1 class="hero__name reveal" style="--i:1">${esc(brand.name)}<span class="sr-only"> — ${esc(brand.role)}</span></h1>
      <p class="hero__bio reveal" style="--i:2">${rich(brand.bio)}</p>
    </div>
  </header>`;
}
