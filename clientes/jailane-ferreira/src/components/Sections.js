import { esc } from '../lib/html.js';
import { resolveAction, resolveChannel, renderTarget } from '../lib/links.js';
import { icon, stars } from './icons.js';
import { Picture } from './Picture.js';

const Cta = (site, cta, className = 'pill pill--brand') =>
  cta
    ? renderTarget(resolveAction(site, cta.action), {
        className,
        label: cta.label,
        content: `<span>${esc(cta.label)}</span>`,
      })
    : '';

// Ícones das curiosidades (traço fino, mesmo estilo de icons.js).
const FACT_ICONS = {
  estrela: '<path d="M12 3.5l2.4 5.1 5.6.7-4.1 3.9 1 5.5L12 16l-4.9 2.7 1-5.5L4 9.3l5.6-.7z"/>',
  coracao: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  escudo: '<path d="M12 3.5l7 2.8v5.2c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6.3z"/><path d="M9 12l2 2 4-4"/>',
  mapa: '<path d="M9 4.5l-5 2v13l5-2 6 2 5-2v-13l-5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
};
const factIcon = (name) =>
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${FACT_ICONS[name] || FACT_ICONS.estrela}</svg>`;

/**
 * "Quem é": painel com saudação, parágrafos, propósito em destaque e curiosidades.
 * `greeting`, `purpose` e `facts` são opcionais.
 */
export const About = ({ about }) =>
  `<section class="about" id="${esc(about.id)}" aria-labelledby="${esc(about.id)}-title">
    <div class="about__panel reveal">
      ${about.greeting ? `<p class="about__greeting">${esc(about.greeting)}</p>` : ''}
      <h2 class="about__title" id="${esc(about.id)}-title" tabindex="-1">
        ${about.titleLead ? `<span class="light">${esc(about.titleLead)}</span> ` : ''}${esc(about.title)}
      </h2>
      ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${
        about.purpose
          ? `<blockquote class="about__purpose">
        <span class="about__purpose-label">${esc(about.purpose.label)}</span>
        <p>${esc(about.purpose.text)}</p>
      </blockquote>`
          : ''
      }
    </div>
    ${
      about.facts?.length
        ? `<div class="facts">
      <h3 class="facts__title reveal">${esc(about.factsTitle || 'Curiosidades sobre mim')}</h3>
      <ul class="facts__list">${about.facts
        .map(
          (f, i) => `<li class="fact reveal" style="--i:${i}">
          <span class="fact__icon">${factIcon(f.icon)}</span>
          <p class="fact__text">${esc(f.text)}</p>
        </li>`,
        )
        .join('')}</ul>
    </div>`
        : ''
    }
  </section>`;

/**
 * Tabela de valores: categorias recolhíveis (a primeira aberta), cada serviço com duração e preço.
 * Tocar num serviço abre o WhatsApp com o nome dele na mensagem.
 */
function PriceGroups(site, groups) {
  const message = site.services.bookingMessage || 'Olá! Quero agendar: {servico}.';
  return groups
    .map((group, g) => {
      const rows = group.items
        .map((item) => {
          // `link` (ou `services.bookingUrl`): página de agendamento online; sem nenhum, abre o WhatsApp com o nome do serviço.
          const link = item.link || site.services.bookingUrl;
          const target = link
            ? { href: link, external: true, pending: false }
            : resolveChannel(site, 'whatsapp', { message: message.replace('{servico}', item.title) });
          const thumb = item.photo ? `<img class="price__photo" src="${esc(item.photo)}" alt="" width="72" height="72" loading="lazy" decoding="async">` : '';
          const content = `${thumb}<span class="price__main">
              <span class="price__title">${esc(item.title)}</span>
              ${item.note ? `<span class="price__note">${esc(item.note)}</span>` : ''}
            </span>
            <span class="price__side">
              <span class="price__value">${esc(item.price)}</span>
              ${item.duration ? `<span class="price__time">${esc(item.duration)}</span>` : ''}
            </span>`;
          return `<li>${renderTarget(target, { className: 'price', label: 'WhatsApp', ariaLabel: `Agendar ${item.title}${link ? '' : ' pelo WhatsApp'} (abre em nova aba)`, content })}</li>`;
        })
        .join('');
      return `<details class="price-group reveal" style="--i:${g}"${g === 0 ? ' open' : ''}>
        <summary class="price-group__head">
          <span>${esc(group.title)}</span>
          <span class="price-group__count">${group.items.length}</span>
        </summary>
        <ul class="price-group__list">${rows}</ul>
      </details>`;
    })
    .join('');
}

/** Endereço com botão para o mapa. */
export function Location(site) {
  const place = site.place;
  if (!place) return '';
  const target = resolveChannel(site, 'location');
  return `<section class="section" id="${esc(place.id)}" aria-labelledby="${esc(place.id)}-title">
    <div class="place reveal">
      <span class="place__icon" aria-hidden="true">${icon('pin', { size: 26 })}</span>
      <h2 class="place__title" id="${esc(place.id)}-title">${esc(place.title)}</h2>
      ${place.lines.map((l) => `<p class="place__line">${esc(l)}</p>`).join('')}
      ${renderTarget(target, { className: 'pill pill--brand place__cta', label: 'Localização', content: `<span>${esc(place.cta)}</span>` })}
    </div>
  </section>`;
}

/**
 * Topo da página /servicos/: foto que se dissolve no fundo creme, com o título logo abaixo.
 */
const ServicesCover = (services) => `<header class="capa-servicos">
    <figure class="capa-servicos__media">${Picture(services.pagePhoto, { className: 'capa-servicos__photo', sizes: '(min-width: 560px) 460px, 100vw', priority: true })}</figure>
    <div class="capa-servicos__content">
      <p class="section__eyebrow reveal">${esc(services.eyebrow)}</p>
      <h1 class="capa-servicos__title reveal" id="${esc(services.id)}-title" tabindex="-1" style="--i:1">${esc(services.title)}</h1>
      ${services.intro ? `<p class="capa-servicos__intro reveal" style="--i:2">${esc(services.intro)}</p>` : ''}
    </div>
  </header>`;

/** `titulo`: 'h1' quando os serviços são a página inteira (/servicos/); lá, com `pagePhoto`, o topo vira a capa com foto. */
export function Services(site, { titulo = 'h2' } = {}) {
  const { services } = site;
  if (services.groups) {
    const capa = titulo === 'h1' && services.pagePhoto;
    return `${capa ? ServicesCover(services) : ''}<section class="section section--page${capa ? ' section--capa' : ''}" id="${esc(services.id)}" aria-labelledby="${esc(services.id)}-title">
    ${capa ? '' : `<header class="section__header reveal">
      <p class="section__eyebrow">${esc(services.eyebrow)}</p>
      <${titulo} class="section__title" id="${esc(services.id)}-title" tabindex="-1">${esc(services.title)}</${titulo}>
      ${services.intro ? `<p class="section__intro">${esc(services.intro)}</p>` : ''}
    </header>`}
    <div class="price-groups">${PriceGroups(site, services.groups)}</div>
    <div class="section__cta reveal">${Cta(site, services.cta)}</div>
  </section>`;
  }
  const items = services.items
    .map(
      (item, i) => `<li class="service reveal" style="--i:${i}">
        <span class="service__index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3 class="service__title">${esc(item.title)}</h3>
          <p class="service__desc">${esc(item.description)}</p>
        </div>
      </li>`,
    )
    .join('');
  return `<section class="section" id="${esc(services.id)}" aria-labelledby="${esc(services.id)}-title">
    <header class="section__header reveal">
      <p class="section__eyebrow">${esc(services.eyebrow)}</p>
      <h2 class="section__title" id="${esc(services.id)}-title" tabindex="-1">${esc(services.title)}</h2>
    </header>
    <ol class="services">${items}</ol>
    <div class="section__cta reveal">${Cta(site, services.cta)}</div>
  </section>`;
}

export function Testimonials({ testimonials: t }) {
  const initials = (name) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('');
  const items = t.items
    .map(
      (item, i) => `<li class="testimonial reveal" style="--i:${i}">
        <figure>
          <figcaption class="testimonial__head">
            <span class="testimonial__avatar" aria-hidden="true">${esc(initials(item.name))}</span>
            <span><span class="testimonial__name">${esc(item.name)}</span>${stars(item.rating)}</span>
          </figcaption>
          <blockquote class="testimonial__text"><p>${esc(item.text)}</p></blockquote>
        </figure>
      </li>`,
    )
    .join('');
  return `<section class="section" id="${esc(t.id)}" aria-labelledby="${esc(t.id)}-title">
    <header class="section__header reveal">
      <h2 class="section__title section__title--mixed" id="${esc(t.id)}-title" tabindex="-1">
        ${esc(t.titleLead)} <strong>${esc(t.titleStrong)}</strong><br><em>${esc(t.titleItalic)}</em>
      </h2>
    </header>
    <ul class="testimonials" tabindex="0" aria-label="Depoimentos (role para ver mais)">${items}</ul>
    ${t.note ? `<p class="section__note reveal">${esc(t.note)}</p>` : ''}
  </section>`;
}

export function FinalCta(site) {
  const f = site.finalCta;
  return `<section class="final" aria-labelledby="final-title">
    <div class="final__panel">
      <figure class="final__media">${Picture(f.photo, { sizes: '(min-width: 960px) 520px, 100vw' })}</figure>
      <div class="final__card reveal">
        <h2 class="final__title" id="final-title"><span class="light">${esc(f.titleLead)}</span> <em>${esc(f.titleItalic)}</em></h2>
        <p class="final__text">${esc(f.text)}</p>
        ${Cta(site, f.cta)}
      </div>
    </div>
  </section>`;
}
