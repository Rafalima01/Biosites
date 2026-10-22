import { esc, attrs } from '../lib/html.js';

/**
 * Monograma em moldura oval vertical com gradiente dourado.
 * Aceita `{ letters: ['S','B'] }` (SVG gerado) ou `{ src, alt }` (logotipo do cliente).
 */
export function Monogram(monogram, brandName) {
  if (monogram.src) {
    return `<img ${attrs({ class: 'monogram', src: monogram.src, alt: monogram.alt || `Logotipo ${brandName}` })}>`;
  }
  const [first = '', second = ''] = monogram.letters;
  return `<svg class="monogram" viewBox="0 0 120 184" role="img" aria-label="Monograma ${esc(brandName)}">
  <defs>
    <linearGradient id="mono-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="var(--color-gold-light)"/>
      <stop offset=".45" stop-color="var(--color-gold)"/>
      <stop offset="1" stop-color="var(--color-gold-dark)"/>
    </linearGradient>
  </defs>
  <rect x="3" y="3" width="114" height="178" rx="57" fill="none" stroke="url(#mono-gold)" stroke-width="2.4"/>
  <text x="47" y="126" text-anchor="middle" class="monogram__letter" fill="url(#mono-gold)" opacity=".9">${esc(first)}</text>
  <text x="71" y="131" text-anchor="middle" class="monogram__letter" fill="url(#mono-gold)">${esc(second)}</text>
</svg>`;
}
