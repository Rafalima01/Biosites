import { esc, attrs } from '../lib/html.js';

/** Símbolo (arquivo da marca) + palavra "VERTEX LABS" em tipografia. */
export const Lockup = ({ brand }, { size = 'md' } = {}) =>
  `<span class="lockup lockup--${size}">
    <img ${attrs({ class: 'lockup__mark', src: brand.mark.src, alt: '', width: 40, height: 26 })}>
    <span class="lockup__word" aria-hidden="true"><span class="lockup__vertex">Vertex</span><span class="lockup__labs">Labs</span></span>
    <span class="sr-only">${esc(brand.name)}</span>
  </span>`;
