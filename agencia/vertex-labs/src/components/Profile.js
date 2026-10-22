import { esc, attrs } from '../lib/html.js';
import { T } from '../lib/i18n.js';
import { resolveChannel, renderTarget } from '../lib/links.js';
import { actionElement } from '../lib/actions.js';
import { icon } from './icons.js';

// Contatos sem destino (ex.: e-mail ainda não informado) ficam ocultos até serem configurados.
export function Socials(site, className = 'socials') {
  const items = site.socials
    .map((key) => resolveChannel(site, key))
    .filter((target) => !target.pending)
    .map(
      (target) =>
        `<li>${renderTarget(target, {
          className: 'icon-btn',
          ariaLabel: target.label,
          content: icon(target.icon, { size: 20 }),
        })}</li>`,
    )
    .join('');
  return `<ul class="${className}" aria-label="Redes e contatos">${items}</ul>`;
}

export function Profile(site) {
  const { brand, cta } = site;
  const instagram = resolveChannel(site, 'instagram');
  const ctaContent = `
    <span class="cta__icon" aria-hidden="true"><img src="${esc(brand.mark.src)}" alt="" width="40" height="26"></span>
    <span class="cta__body">
      <span class="cta__title">${T(cta.title)}</span>
      <span class="cta__text">${T(cta.text)}</span>
    </span>
    <span class="cta__arrow" aria-hidden="true">${icon('arrowUpRight', { size: 20, stroke: 2 })}</span>`;

  return `<header class="profile" id="topo">
    <div class="profile__avatar reveal"><img ${attrs({ src: brand.mark.src, alt: brand.mark.alt, width: 120, height: 78 })}></div>
    <p class="profile__status reveal" style="--i:1"><span class="profile__dot" aria-hidden="true"></span>${T(brand.status)}</p>
    <h1 class="profile__name reveal" style="--i:1">${esc(brand.name)}<span class="profile__sep" aria-hidden="true"></span><span class="profile__role">${T(brand.role)}</span></h1>
    ${instagram.pending ? '' : `<a class="profile__handle reveal" style="--i:2" href="${esc(instagram.href)}" target="_blank" rel="noopener noreferrer">${esc(brand.handle)}</a>`}
    <p class="profile__slogan reveal" style="--i:2">${T(brand.slogan.lead)} <em>${T(brand.slogan.accent)}</em></p>
    <p class="profile__bio reveal" style="--i:3">${T(brand.bio)}</p>
    <div class="reveal" style="--i:4">${Socials(site)}</div>
  </header>
  <div class="reveal" style="--i:5">${actionElement(site, cta.action, { className: 'cta', content: ctaContent })}</div>`;
}
