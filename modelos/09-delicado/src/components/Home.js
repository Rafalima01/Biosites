import { esc } from '../lib/html.js';
import { resolveAction, resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

/** Topo: foto, nome em duas cores e especialidades. */
export function Hero(site) {
  const { brand, hero } = site;
  return `<header class="hero">
    <div class="hero__media">
      ${Picture(hero.photo, { className: 'hero__photo', sizes: '(min-width: 960px) 440px, 100vw', priority: true })}
    </div>
    <div class="hero__text">
      <h1 class="hero__name"><span class="hero__first">${esc(brand.firstName)}</span> <span class="hero__last">${esc(brand.lastName)}</span></h1>
      <p class="hero__tagline">${brand.tagline.map(esc).join('<span aria-hidden="true"> • </span>')}</p>
    </div>
  </header>`;
}

/** Cards do topo: ícone, título, apoio e seta. */
export function Menu(site) {
  const items = site.menu
    .map((m) => {
      const target = resolveAction(site, m.action);
      return `<li>${renderTarget(target, {
        className: 'menu__item',
        label: m.title,
        content: `<span class="menu__icon">${icon(m.icon, { size: 28, stroke: 1.4 })}</span>
          <span class="menu__text"><span class="menu__title">${esc(m.title)}</span><span class="menu__sub">${esc(m.text)}</span></span>
          <span class="menu__go">${icon('chevronRight', { size: 18, stroke: 1.6 })}</span>`,
      })}</li>`;
    })
    .join('');
  return `<nav class="menu" aria-label="Links principais"><ul class="menu__list">${items}</ul></nav>`;
}

export const Phrase = ({ phrase }) =>
  `<p class="phrase">${esc(phrase.text)}<span class="phrase__script">${esc(phrase.script)}</span></p>`;

/** "Sobre mim": texto à esquerda e foto que se dissolve no fundo. */
export function About(site) {
  const { about, brand } = site;
  return `<section class="about reveal" id="${esc(about.id)}" aria-labelledby="about-title">
    <span class="signature about__signature" aria-hidden="true">${esc(brand.signature)}</span>
    <div class="about__text">
      <h2 class="title" id="about-title" tabindex="-1">${esc(about.title)} <em>${esc(about.titleAccent)}</em></h2>
      ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
    </div>
    <div class="about__photo">${Picture(about.photo, { sizes: '(min-width: 960px) 300px, 55vw' })}</div>
  </section>`;
}

/** "Como posso te ajudar": colunas com ícone, título e texto. */
export function Help({ help }) {
  const items = help.items
    .map(
      (h) => `<li class="help__item">
        <span class="help__icon">${icon(h.icon, { size: 30, stroke: 1.3 })}</span>
        <h3 class="help__title">${esc(h.title)}</h3>
        <p class="help__text">${esc(h.text)}</p>
      </li>`,
    )
    .join('');
  return `<section class="panel help reveal" aria-labelledby="help-title">
    <h2 class="kicker" id="help-title">${esc(help.title)}</h2>
    <ul class="help__list">${items}</ul>
  </section>`;
}

/** Faixa rosa com o botão de agendamento. */
export function Cta(site) {
  const { cta } = site;
  const target = resolveChannel(site, 'whatsapp', { message: cta.message });
  return `<section class="cta reveal" aria-label="Agendamento">
    <p class="cta__text">${esc(cta.text)}</p>
    ${renderTarget(target, {
      className: 'cta__btn',
      label: 'WhatsApp',
      content: `<span>${esc(cta.label)}</span>${icon('whatsapp', { size: 20 })}`,
    })}
  </section>`;
}

/** Fotos de trabalhos (legenda em serifa opcional: `caption`). */
export function Gallery({ gallery }) {
  if (!gallery.items.length) return '';
  const items = gallery.items
    .map(
      (g, i) => `<li class="shot${g.caption ? ' shot--caption' : ''} reveal" style="--i:${i}">
        ${Picture(g.photo, { className: 'shot__img', sizes: '(min-width: 960px) 135px, 46vw' })}
        ${g.caption ? `<span class="shot__caption">${esc(g.caption)}</span>` : ''}
      </li>`,
    )
    .join('');
  return `<section class="gallery" id="${esc(gallery.id)}" aria-labelledby="gallery-title">
    <h2 class="kicker" id="gallery-title" tabindex="-1">${esc(gallery.title)}</h2>
    <ul class="gallery__grid">${items}</ul>
  </section>`;
}

/** Dúvidas frequentes: perguntas que abrem e fecham. */
export function Faq({ faq }) {
  if (!faq.items.length) return '';
  const items = faq.items
    .map(
      (f) => `<details class="faq__item">
        <summary>${esc(f.q)}${icon('chevronDown', { size: 18, stroke: 1.6, className: 'faq__chev' })}</summary>
        <p>${esc(f.a)}</p>
      </details>`,
    )
    .join('');
  return `<section class="faq reveal" aria-labelledby="faq-title">
    <h2 class="kicker" id="faq-title">${esc(faq.title)}</h2>
    <div class="faq__list">${items}</div>
  </section>`;
}
