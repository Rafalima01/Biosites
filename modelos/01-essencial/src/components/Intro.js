import { esc, attrs } from '../lib/html.js';
import { resolveChannel, renderTarget } from '../lib/links.js';
import { icon, ornamentDivider } from './icons.js';
import { Monogram } from './Monogram.js';

const florals = `<svg class="intro__decor" viewBox="0 0 120 220" aria-hidden="true" focusable="false">
  <g fill="none" stroke="currentColor" stroke-width=".9" stroke-linecap="round">
    <path d="M118 6C96 40 92 82 104 128s4 74-10 90"/><path d="M106 58c-10-6-22-6-30 2"/><path d="M101 104c-12-2-22 4-26 14"/><path d="M104 150c8-8 10-18 8-28"/>
  </g>
  <g fill="currentColor">
    <ellipse cx="72" cy="58" rx="10" ry="6.5" transform="rotate(-24 72 58)" opacity=".55"/>
    <ellipse cx="84" cy="48" rx="9" ry="6" transform="rotate(34 84 48)" opacity=".4"/>
    <ellipse cx="70" cy="120" rx="9.5" ry="6" transform="rotate(-40 70 120)" opacity=".5"/>
    <ellipse cx="82" cy="110" rx="8" ry="5.5" transform="rotate(22 82 110)" opacity=".38"/>
    <ellipse cx="112" cy="122" rx="8.5" ry="5.5" transform="rotate(70 112 122)" opacity=".45"/>
    <ellipse cx="108" cy="20" rx="9" ry="6" transform="rotate(-10 108 20)" opacity=".5"/>
    <ellipse cx="96" cy="28" rx="7.5" ry="5" transform="rotate(40 96 28)" opacity=".35"/>
    <ellipse cx="96" cy="176" rx="8" ry="5" transform="rotate(-30 96 176)" opacity=".4"/>
  </g>
</svg>`;

function Portrait({ src, alt, width, height, position }) {
  return `<figure class="intro__portrait">
    <img ${attrs({ src, alt, width, height, fetchpriority: 'high', decoding: 'async', style: position ? `object-position:${position}` : null })}>
  </figure>`;
}

export function Intro(site) {
  const { brand } = site;
  const socials = site.heroLinks
    .map((key) => {
      const target = resolveChannel(site, key);
      return `<li>${renderTarget(target, {
        className: 'chip',
        ariaLabel: target.pending ? `${target.label} (não configurado)` : `${target.label} (abre em nova aba)`,
        content: icon(target.icon, { size: 20 }),
      })}</li>`;
    })
    .join('');

  return `<div class="intro__hero">
    ${Portrait(brand.portrait)}
    ${brand.decor === 'florals' ? florals : ''}
    <header class="brand">
      <div class="brand__mark reveal" style="--i:0">${Monogram(brand.monogram, `${brand.eyebrow} ${brand.name}`)}</div>
      <p class="brand__eyebrow reveal" style="--i:1">${esc(brand.eyebrow)}</p>
      <h1 class="brand__name reveal" style="--i:1"><span class="sr-only">${esc(brand.eyebrow)} </span>${esc(brand.name)}<span class="sr-only"> — ${esc(brand.specialty)}</span></h1>
      <p class="brand__specialty reveal" style="--i:2" aria-hidden="true">${esc(brand.specialty)}</p>
      <div class="reveal" style="--i:2">${ornamentDivider('ornament brand__ornament')}</div>
      <p class="brand__tagline reveal" style="--i:3">${esc(brand.tagline)}</p>
      <ul class="brand__socials reveal" style="--i:4" aria-label="Contatos rápidos">${socials}</ul>
    </header>
  </div>`;
}
