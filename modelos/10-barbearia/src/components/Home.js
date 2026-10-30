import { esc } from '../lib/html.js';
import { resolveAction, resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

/** Topo: foto que se dissolve no fundo, rótulo espaçado, nome em serifa + manuscrita e setinha. */
export function Hero(site) {
  const { brand, hero } = site;
  return `<header class="hero">
    <div class="hero__media">
      ${Picture(hero.photo, { className: 'hero__photo', sizes: '(min-width: 960px) 430px, (min-width: 560px) 520px, 100vw', priority: true })}
    </div>
    <div class="hero__text">
      <p class="hero__kicker">${esc(brand.kicker)}</p>
      <h1 class="hero__name"><span class="hero__first">${esc(brand.firstName)}</span> <span class="hero__last">${esc(brand.lastName)}</span></h1>
    </div>
  </header>`;
}

/**
 * Calendário 3D (Fluent Emoji da Microsoft, licença MIT) recolorido para o laranja da marca,
 * com o dia de hoje por cima (atualizado no navegador por main.js; o HTML traz o dia do build).
 */
const CalendarArt = () => `<span class="cal3d" aria-hidden="true">
    <img class="cal3d__img" src="/media/calendario-3d.png" alt="" width="256" height="256" loading="lazy" decoding="async">
    <img class="cal3d__img cal3d__img--top" src="/media/calendario-3d.png" alt="" width="256" height="256" loading="lazy" decoding="async">
    <span class="cal3d__day" data-today>${new Date().getDate()}</span>
  </span>`;

/** Cards grandes: texto e botão em pílula de um lado, foto (ou a folhinha) do outro. */
export function Cards(site) {
  const items = site.cards
    .map((c, i) => {
      const target = resolveAction(site, c.action);
      const media = c.art === 'calendar'
        ? `<span class="card__art">${CalendarArt()}</span>`
        : `<span class="card__media">${Picture(c.photo, { className: 'card__photo', sizes: '(min-width: 560px) 260px, 50vw' })}</span>`;
      const badge = c.badge ? `<span class="card__badge" aria-hidden="true">${icon(c.badge, { size: 20, stroke: 2 })}</span>` : '';
      return `<li class="reveal" style="--i:${i}">${renderTarget(target, {
        className: `card card--${c.art ? 'art' : 'photo'}${i % 2 ? ' card--flip' : ''}`,
        label: c.title,
        content: `${media}${badge}
          <span class="card__body">
            <span class="card__title">${esc(c.title)}</span>
            <span class="card__text">${esc(c.text)}</span>
            <span class="pill">${esc(c.button)}</span>
          </span>`,
      })}</li>`;
    })
    .join('');
  return `<nav class="cards" id="cards" aria-label="Links principais">
    <a class="cards__more" href="#cards" data-scroll aria-label="Ver os links">${icon('chevronsDown', { size: 24, stroke: 2 })}</a>
    <ul class="cards__list">${items}</ul>
  </nav>`;
}

/** Cabeçalho das seções: rótulo espaçado + título em serifa com destaque manuscrito. */
const Head = ({ id, kicker, title, accent, focus = false }) => `<header class="head">
    <p class="head__kicker">${esc(kicker)}</p>
    <h2 class="head__title" id="${esc(id)}"${focus ? ' tabindex="-1"' : ''}>${esc(title)}${accent ? ` <em>${esc(accent)}</em>` : ''}</h2>
  </header>`;

/** Sobre o barbeiro: texto e três destaques. */
export function About({ about }) {
  const highlights = about.highlights
    .map((h) => `<li class="stat"><strong class="stat__value">${esc(h.value)}</strong><span class="stat__label">${esc(h.label)}</span></li>`)
    .join('');
  return `<section class="panel about reveal" id="${esc(about.id)}" aria-labelledby="about-title">
    ${Head({ id: 'about-title', kicker: about.kicker, title: about.title, accent: about.titleAccent, focus: true })}
    ${about.paragraphs.map((p) => `<p class="about__p">${esc(p)}</p>`).join('')}
    <ul class="stats">${highlights}</ul>
  </section>`;
}

/** Cortes da semana: grade de fotos com legenda e link para mais. */
export function Gallery(site) {
  const { gallery } = site;
  if (!gallery.items.length) return '';
  const items = gallery.items
    .map(
      (g, i) => `<li class="shot reveal" style="--i:${i}">
        ${Picture(g.photo, { className: 'shot__img', sizes: '(min-width: 960px) 270px, 46vw' })}
        <span class="shot__caption">${esc(g.caption)}</span>
      </li>`,
    )
    .join('');
  const more = gallery.more
    ? renderTarget(resolveAction(site, gallery.more.action), {
        className: 'link-more',
        label: gallery.more.label,
        content: `${icon('instagram', { size: 18 })}<span>${esc(gallery.more.label)}</span>${icon('chevronRight', { size: 16 })}`,
      })
    : '';
  return `<section class="panel gallery" id="${esc(gallery.id)}" aria-labelledby="gallery-title">
    ${Head({ id: 'gallery-title', kicker: gallery.kicker, title: gallery.title, focus: true })}
    <ul class="gallery__grid">${items}</ul>
    ${more}
  </section>`;
}

/** O espaço: foto do salão, comodidades, horários, endereço e botão do mapa. */
export function Space(site) {
  const { space, schedule } = site;
  const map = resolveChannel(site, 'location');
  const perks = space.perks.map((p) => `<li>${icon('check', { size: 15, stroke: 2 })}${esc(p)}</li>`).join('');
  const hours = schedule
    .map((h) => `<li><span>${esc(h.day)}</span><span class="${/fechado/i.test(h.time) ? 'is-closed' : ''}">${esc(h.time)}</span></li>`)
    .join('');
  return `<section class="panel space reveal" id="${esc(space.id)}" aria-labelledby="space-title">
    ${Head({ id: 'space-title', kicker: space.kicker, title: space.title, focus: true })}
    <div class="space__photo">${Picture(space.photo, { sizes: '(min-width: 960px) 520px, 92vw' })}</div>
    <ul class="perks">${perks}</ul>
    <div class="space__info">
      <div>
        <h3 class="space__label">${icon('clock', { size: 16 })}Horários</h3>
        <ul class="hours">${hours}</ul>
      </div>
      <div>
        <h3 class="space__label">${icon('pin', { size: 16 })}Endereço</h3>
        <p class="space__address">${esc(space.address)}</p>
        ${renderTarget(map, { className: 'pill pill--ghost', label: 'Abrir no mapa', content: `<span>Abrir no mapa</span>${icon('chevronRight', { size: 15 })}` })}
      </div>
    </div>
  </section>`;
}

/** Chamada final para o WhatsApp. */
export function Cta(site) {
  const { cta } = site;
  const target = resolveAction(site, cta.action);
  return `<section class="cta reveal" aria-labelledby="cta-title">
    <h2 class="cta__title" id="cta-title">${esc(cta.title)}</h2>
    <p class="cta__text">${esc(cta.text)}</p>
    ${renderTarget(target, {
      className: 'pill pill--big',
      label: cta.label,
      content: `${icon('whatsapp', { size: 20 })}<span>${esc(cta.label)}</span>`,
    })}
  </section>`;
}
