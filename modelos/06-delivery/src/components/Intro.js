import { esc, attrs } from '../lib/html.js';
import { hoursLabel } from '../lib/hours.js';

/** Selo circular amarelo gerado em SVG (ou o logotipo do cliente, se `logo.src` existir). */
function Logo({ logo, name }) {
  if (logo.src) return `<img ${attrs({ class: 'logo', src: logo.src, alt: logo.alt || `Logotipo ${name}` })}>`;
  return `<svg class="logo" viewBox="0 0 200 200" role="img" aria-label="Logotipo ${esc(name)}">
    <circle cx="100" cy="100" r="98" fill="var(--color-ink-deep)"/>
    <circle cx="100" cy="100" r="88" fill="var(--yellow)"/>
    <circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-ink-deep)" stroke-width="1.2" opacity=".35"/>
    <text x="100" y="86" text-anchor="middle" class="logo__top">${esc(logo.top)}</text>
    <text x="100" y="106" text-anchor="middle" class="logo__middle">${esc(logo.middle)}</text>
    <rect x="44" y="116" width="112" height="28" rx="4" fill="none" stroke="var(--color-ink-deep)" stroke-width="2.4"/>
    <text x="100" y="137" text-anchor="middle" class="logo__band">${esc(logo.band)}</text>
  </svg>`;
}

export function Intro({ brand, hours }) {
  return `<header class="intro">
    <div class="intro__logo reveal">${Logo({ logo: brand.logo, name: brand.name })}</div>
    <h1 class="intro__name reveal" style="--i:1">${esc(brand.name)}</h1>
    <p class="intro__subtitle reveal" style="--i:1">${esc(brand.subtitle)}</p>
    <p class="intro__desc reveal" style="--i:2">${esc(brand.description)}</p>
    ${
      hours
        ? `<p class="status reveal" style="--i:3" data-hours='${esc(JSON.stringify(hours))}'>
      <span class="status__dot" aria-hidden="true"></span>
      <span>${esc(hoursLabel(hours))}</span>
      <span class="status__state" data-state></span>
    </p>`
        : ''
    }
  </header>`;
}
