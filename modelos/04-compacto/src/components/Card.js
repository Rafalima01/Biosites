import { esc } from '../lib/html.js';
import { resolveAction, resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';
import { Monogram } from './Monogram.js';
import { Picture } from './Picture.js';

export function Cover(site) {
  return `<div class="cover">
    ${Picture(site.cover, { className: 'cover__photo', sizes: '(min-width: 960px) 50vw, 100vw', priority: true })}
    ${Monogram(site.brand.monogram, { outline: true, className: 'cover__monogram' })}
  </div>`;
}

function Profile(site) {
  return `<div class="profile">
    <span class="profile__band" aria-hidden="true"><span class="profile__line"></span></span>
    <figure class="profile__ring">
      ${Picture(site.portrait, { className: 'profile__photo', sizes: '240px', priority: true })}
    </figure>
  </div>`;
}

function Brand({ brand }) {
  return `<header class="brand reveal">
    ${Monogram(brand.monogram, { className: 'brand__monogram' })}
    <div class="brand__text">
      <h1 class="brand__name">${esc(brand.name)}</h1>
      <p class="brand__role">${esc(brand.role)}</p>
    </div>
  </header>`;
}

function Actions(site) {
  const buttons = site.actions
    .map(
      (item) =>
        `<li>${renderTarget(resolveAction(site, item.action), {
          className: 'action',
          label: item.label,
          content: esc(item.label),
        })}</li>`,
    )
    .join('');
  return `<nav class="actions reveal" style="--i:1" aria-label="Navegação principal"><ul>${buttons}</ul></nav>`;
}

function DockLink(site, key, className) {
  const target = resolveChannel(site, key);
  return renderTarget(target, {
    className,
    ariaLabel: target.pending ? `${target.label} (não configurado)` : `${target.label} (abre em nova aba)`,
    content: icon(target.icon, { size: 26, stroke: 1.7 }),
  });
}

function Dock(site) {
  const { left = [], center, right = [] } = site.dock;
  const side = (keys) => keys.map((k) => `<li>${DockLink(site, k, 'dock__link')}</li>`).join('');
  return `<nav class="dock reveal" style="--i:3" aria-label="Redes e contatos">
    <ul class="dock__side">${side(left)}</ul>
    ${center ? `<div class="dock__center">${DockLink(site, center, 'dock__main')}</div>` : ''}
    <ul class="dock__side">${side(right)}</ul>
  </nav>`;
}

export function Card(site) {
  return `<main id="conteudo" class="card">
    <img class="card__ghost" src="${esc(site.portrait.src)}" alt="" aria-hidden="true" loading="lazy" decoding="async">
    ${Profile(site)}
    ${Brand(site)}
    ${Actions(site)}
    <p class="card__text reveal" style="--i:2">${esc(site.brand.description)}</p>
    ${Dock(site)}
    <footer class="footer">
      <p><span data-year>${new Date().getFullYear()}</span> ${esc(site.brand.legalName)}. Todos os direitos reservados.</p>
      ${site.demo && site.footer.demoNote ? `<p class="footer__demo">${esc(site.footer.demoNote)}</p>` : ''}
    </footer>
  </main>`;
}
