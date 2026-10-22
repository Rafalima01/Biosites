import { esc, attrs } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { icon, ornamentDivider } from './icons.js';

function SectionHeader({ id, eyebrow, title, intro }) {
  return `<header class="section__header reveal">
    ${eyebrow ? `<p class="section__eyebrow">${esc(eyebrow)}</p>` : ''}
    <h2 class="section__title" id="${esc(id)}-title" tabindex="-1">${esc(title)}</h2>
    ${ornamentDivider()}
    ${intro ? `<p class="section__intro">${esc(intro)}</p>` : ''}
  </header>`;
}

function SectionCta(site, cta) {
  if (!cta) return '';
  const target = resolveAction(site, cta.action);
  return `<div class="section__cta reveal">${renderTarget(target, {
    className: 'button',
    label: cta.label,
    content: `<span>${esc(cta.label)}</span>${icon('chevronRight', { size: 16, stroke: 1.6 })}`,
  })}</div>`;
}

const DemoNote = (text) => (text ? `<p class="section__note reveal">${esc(text)}</p>` : '');

function Procedures(site, section) {
  const items = section.items
    .map(
      (item, i) => `<li class="procedure reveal" style="--i:${i % 3}">
        <span class="procedure__icon" aria-hidden="true">${icon('sparkle', { size: 16, stroke: 1.3 })}</span>
        <h3 class="procedure__title">${esc(item.title)}</h3>
        <p class="procedure__desc">${esc(item.description)}</p>
      </li>`,
    )
    .join('');
  return `<ul class="procedures">${items}</ul>`;
}

function Gallery(site, section) {
  const items = section.items
    .map(
      (item, i) => `<li class="gallery__item reveal" style="--i:${i % 4}">
        <button ${attrs({
          type: 'button',
          class: 'gallery__button',
          'data-lightbox': i,
          'data-full': item.full,
          'data-caption': item.alt,
          'data-credit': item.credit,
          'aria-label': `Ampliar imagem: ${item.alt}`,
        })}>
          <img ${attrs({ src: item.thumb, alt: item.alt, loading: 'lazy', decoding: 'async', width: 640, height: 800 })}>
        </button>
      </li>`,
    )
    .join('');
  return `<ul class="gallery" data-gallery>${items}</ul>`;
}

const RENDERERS = { procedures: Procedures, gallery: Gallery };

export function Sections(site) {
  return site.sections
    .map((section) => {
      const render = RENDERERS[section.type];
      if (!render) throw new Error(`Tipo de seção desconhecido: "${section.type}"`);
      return `<section class="section section--${esc(section.type)}" id="${esc(section.id)}" aria-labelledby="${esc(section.id)}-title">
        <div class="section__inner">
          ${SectionHeader(section)}
          ${render(site, section)}
          ${DemoNote(section.demoNote)}
          ${SectionCta(site, section.cta)}
        </div>
      </section>`;
    })
    .join('');
}

/** Visualizador ampliado da galeria (controlado por `src/behaviors/lightbox.js`). */
export const Lightbox = () => `<dialog class="lightbox" aria-label="Visualização ampliada">
  <div class="lightbox__frame">
    <img class="lightbox__image" alt="">
    <p class="lightbox__caption"><span data-caption></span><small data-credit></small></p>
  </div>
  <button type="button" class="lightbox__btn lightbox__close" data-close aria-label="Fechar">${icon('close', { size: 20 })}</button>
  <button type="button" class="lightbox__btn lightbox__prev" data-prev aria-label="Imagem anterior">${icon('chevronLeft', { size: 22 })}</button>
  <button type="button" class="lightbox__btn lightbox__next" data-next aria-label="Próxima imagem">${icon('chevronRight', { size: 22 })}</button>
</dialog>`;
