import { esc } from '../lib/html.js';

/**
 * Monograma de duas letras sobrepostas em serifa.
 * `outline: true` desenha só o contorno (usado como marca d'água sobre a foto de capa).
 */
export function Monogram([first = '', second = ''], { outline = false, className = 'monogram', label } = {}) {
  const paint = outline
    ? 'fill="none" stroke="currentColor" stroke-width="0.9"'
    : 'fill="url(#mono-cream)"';
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="${className}" viewBox="0 0 170 150" ${a11y}>
    ${outline ? '' : `<defs><linearGradient id="mono-cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--color-cream)"/><stop offset="1" stop-color="var(--color-cream-deep)"/></linearGradient></defs>`}
    <text x="58" y="128" text-anchor="middle" class="monogram__letter" ${paint} ${outline ? '' : 'opacity=".72"'}>${esc(first)}</text>
    <text x="106" y="128" text-anchor="middle" class="monogram__letter" ${paint}>${esc(second)}</text>
  </svg>`;
}
