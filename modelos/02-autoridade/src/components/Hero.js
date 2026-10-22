import { esc } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { Picture } from './Picture.js';

function SocialProof({ value, label, avatars = [] }) {
  const faces = avatars
    .map((a) => `<span class="proof__avatar">${Picture(a, { sizes: '48px' })}</span>`)
    .join('');
  return `<div class="proof">
    ${faces ? `<span class="proof__avatars" aria-hidden="true">${faces}</span>` : ''}
    <p class="proof__text"><strong>${esc(value)}</strong> <span>${esc(label)}</span></p>
  </div>`;
}

export function Hero(site) {
  const { hero, brand } = site;
  const cta = hero.cta
    ? renderTarget(resolveAction(site, hero.cta.action), {
        className: 'pill pill--brand hero__cta',
        label: hero.cta.label,
        content: esc(hero.cta.label),
      })
    : '';

  return `<section class="hero" aria-labelledby="hero-title">
    <figure class="hero__media">
      ${Picture(hero.photo, { className: 'hero__photo', sizes: '(min-width: 960px) 46vw, 100vw', priority: true })}
    </figure>
    <div class="hero__content">
      <div class="hero__proof reveal" style="--i:0">
        ${hero.proof ? SocialProof(hero.proof) : ''}
        ${cta}
      </div>
      <h1 class="hero__name reveal" id="hero-title" style="--i:1">
        <span class="hero__first">${esc(brand.firstName)}</span>
        <span class="hero__last">${esc(brand.lastName)}</span>
      </h1>
      <p class="hero__role reveal" style="--i:2">${esc(brand.role)}</p>
      <p class="hero__tagline reveal" style="--i:3">${esc(brand.tagline)}</p>
    </div>
  </section>`;
}
