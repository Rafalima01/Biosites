import { esc } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { Picture } from './Picture.js';

export function Hero(site) {
  const { hero, brand } = site;
  const stats = hero.stats
    .map((s) => `<div class="stat"><dt class="stat__value">${esc(s.value)}</dt><dd class="stat__label">${esc(s.label)}</dd></div>`)
    .join('');
  const cta = hero.cta
    ? renderTarget(resolveAction(site, hero.cta.action), {
        className: 'btn btn--navy highlights__cta',
        label: hero.cta.label,
        content: esc(hero.cta.label),
      })
    : '';

  return `<section class="hero" aria-labelledby="hero-title">
    <div class="hero__inner">
      <div class="hero__text">
        <h1 class="hero__name reveal" id="hero-title">
          <span>${esc(brand.firstName)}</span>
          <span>${esc(brand.lastName)}</span>
        </h1>
        <p class="hero__role reveal" style="--i:1">${esc(brand.role)}</p>
        <p class="hero__tagline reveal" style="--i:2">${esc(brand.tagline)}</p>
      </div>
      <figure class="hero__media">
        ${Picture(hero.photo, { className: 'hero__photo', sizes: '(min-width: 960px) 46vw, 100vw', priority: true })}
      </figure>
    </div>
  </section>
  <section class="highlights" aria-label="Destaques">
    <div class="highlights__box reveal">
      <dl class="highlights__stats">${stats}</dl>
      ${cta}
    </div>
  </section>`;
}
