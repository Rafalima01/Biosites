import { esc } from '../lib/html.js';
import { resolveAction, resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

const duration = (m) => (m % 60 === 0 ? `${m / 60} h` : m > 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
const money = (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const countServices = (site) => site.services.reduce((n, g) => n + g.items.length, 0);

/** Cartão 1: foto do studio com letreiro em neon e o destaque de agendamento. */
export function StudioCard(site) {
  const { brand, studio, featured, schedule, cta, inspo } = site;
  const booking = resolveChannel(site, 'whatsapp', { message: cta.message });

  return `<article class="glass card card--studio reveal" aria-labelledby="studio-title">
    <div class="studio${studio.layout === 'portrait' ? ' studio--portrait' : ''}">
      ${Picture(studio.photo, { className: 'studio__photo', sizes: '(min-width: 960px) 420px, 100vw', priority: true })}
      <button class="round-btn studio__share" type="button" data-share aria-label="Compartilhar este site">${icon('share', { size: 20 })}</button>
      <div class="studio__sign">
        <p class="neon" aria-hidden="true">${esc(brand.neon)}</p>
        <h1 class="studio__name" id="studio-title">${brand.sign ? `<span class="sr-only">${esc(brand.neon)} </span>${esc(brand.sign)}` : esc(brand.name)}</h1>
      </div>
    </div>

    <div class="featured">
      ${
        featured.photo
          ? `<div class="featured__photo">${Picture(featured.photo, { sizes: '160px' })}</div>`
          : `<div class="featured__photo featured__photo--badge">${icon('sparkle', { size: 34 })}<span>${esc(featured.category || 'Destaque')}</span></div>`
      }
      <div class="featured__body">
        <span class="chip chip--status">${esc(featured.status)}</span>
        <p class="featured__service">${esc(featured.service)}</p>
        <p class="featured__detail">${esc(featured.detail)}</p>
        <div class="designer">
          <span class="designer__photo">${Picture(brand.photo, { sizes: '48px' })}</span>
          <p><strong>${esc(brand.designer)}</strong><span>${esc(brand.role)}</span></p>
        </div>
      </div>
    </div>

    <div class="summary">
      <div class="summary__col">
        <p class="summary__label">Especialidades</p>
        <ul class="specialties">${site.services.map((g) => `<li>${esc(g.category)}</li>`).join('')}</ul>
      </div>
      <div class="summary__col">
        <p class="summary__label">${esc(schedule.label)}</p>
        <p class="summary__value">${esc(schedule.day)}</p>
        <p class="summary__sub">${esc(schedule.time)}</p>
      </div>
    </div>

    ${
      // Só aparece depois que a cliente escolhe alguma foto na galeria (behaviors/inspo.js).
      inspo.items.length
        ? `<div class="picked" data-picked hidden>
      <span class="faces" data-picked-faces></span>
      <p class="picked__text"><strong data-picked-count></strong><span>Vão junto na mensagem do agendamento</span></p>
    </div>`
        : ''
    }

    ${renderTarget(booking, {
      className: 'btn-pink',
      label: 'WhatsApp',
      content: `${icon('whatsapp', { size: 20 })}<span>${esc(cta.label)}</span>`,
      extra: { 'data-book': true, 'data-message': cta.message },
    })}
    <p class="card__note">${esc(cta.note)}</p>
  </article>`;
}

/** Card do início que abre a página de serviços. */
export function ServicesLinkCard(site) {
  const c = site.servicesCard;
  return `<a class="glass card card--menu reveal" style="--i:1" href="/servicos/">
    <span class="menu__body">
      <span class="menu__eyebrow">${countServices(site)} serviços</span>
      <h2 class="card__title">${esc(c.title)}</h2>
      <span class="menu__text">${esc(c.text)}</span>
      <span class="menu__btn">${esc(c.button)}${icon('arrowRight', { size: 16 })}</span>
    </span>
    <span class="menu__photo">${Picture(c.photo, { sizes: '160px' })}</span>
  </a>`;
}

/** Cartão 2: galeria de inspirações com filtros, perfil e seleção. */
export function InspoCard(site) {
  const { inspo, brand } = site;
  if (!inspo.items.length) return '';
  const insta = resolveChannel(site, 'instagram');
  const chips = inspo.tags
    .map((t) => `<button type="button" class="chip chip--filter" data-filter="${esc(t)}" aria-pressed="false">${esc(t)}${icon('close', { size: 14, className: 'chip__x' })}</button>`)
    .join('');
  const tiles = inspo.items
    .map(
      (it, i) => `<li class="tile reveal" style="--i:${i}" data-tags="${esc(it.tags.join('|'))}" data-id="${esc(it.id)}">
      ${Picture(it.photo, { className: 'tile__img', sizes: '(min-width: 960px) 180px, 45vw' })}
      <button type="button" class="tile__like" data-like aria-pressed="false" aria-label="Curtir ${esc(it.title)}">${icon('heart', { size: 22, stroke: 1.8 })}</button>
      <button type="button" class="tile__pick" data-pick aria-pressed="false" aria-label="Escolher ${esc(it.title)} como inspiração" data-title="${esc(it.title)}">
        <span class="tile__plus">${icon('plus', { size: 26, stroke: 1.4 })}</span>
        <span class="tile__check">${icon('check', { size: 26, stroke: 1.6 })}</span>
      </button>
      <span class="tile__title">${esc(it.title)}</span>
    </li>`,
    )
    .join('');

  return `<section class="glass card card--inspo reveal" style="--i:2" aria-labelledby="inspo-title">
    <header class="inspo__head">
      <div>
        <h2 class="inspo__title" id="inspo-title">${esc(inspo.title)}</h2>
        <p class="inspo__sub">${esc(inspo.subtitle)}</p>
      </div>
      <div class="inspo__tools">
        ${renderTarget(insta, { className: 'round-btn', ariaLabel: insta.pending ? 'Instagram (não configurado)' : 'Instagram (abre em nova aba)', content: icon('instagram', { size: 20 }) })}
        <span class="round-btn round-btn--count" aria-live="polite"><span data-like-count>0</span>${icon('heart', { size: 16, stroke: 1.8 })}</span>
      </div>
    </header>
    <div class="chips" role="group" aria-label="Filtrar inspirações">${chips}</div>
    <ul class="tiles">
      <li class="tile tile--profile reveal">
        <span class="profile__photo">${Picture(brand.photo, { sizes: '80px' })}</span>
        <p class="profile__name">${esc(brand.designer)}</p>
        ${renderTarget(insta, { className: 'profile__follow', label: 'Instagram', content: 'Seguir' })}
      </li>
      ${tiles}
    </ul>
    <p class="inspo__empty" data-empty hidden>Nenhuma foto nesse filtro.</p>
  </section>`;
}

/** Contato: WhatsApp, Instagram e mapa em três botões lado a lado. */
export function ContactCard(site, { i = 3 } = {}) {
  const { title, links } = site.contactCard;
  const items = links
    .map((l) => {
      const target = resolveAction(site, l.action);
      const iconName = l.action.type === 'channel' ? resolveChannel(site, l.action.channel).icon : 'link';
      return `<li>${renderTarget(target, {
        className: 'contact__item',
        label: l.label,
        content: `<span class="contact__icon">${icon(iconName, { size: 22 })}</span><span class="contact__label">${esc(l.label)}</span><span class="contact__hint">${esc(l.hint)}</span>`,
      })}</li>`;
    })
    .join('');
  return `<section class="glass card card--contact reveal" style="--i:${i}" aria-labelledby="contact-title">
    <h2 class="card__title" id="contact-title">${esc(title)}</h2>
    <ul class="contact">${items}</ul>
  </section>`;
}

/** Barra do topo da página de serviços: voltar ao início + nome do studio. */
export const Topbar = (site) =>
  `<header class="topbar">
    <a class="round-btn topbar__back" href="/" aria-label="Voltar para o início">${icon('arrowLeft', { size: 20, stroke: 1.8 })}</a>
    <a class="topbar__name" href="/"><span>${esc(site.brand.neon)}</span> ${esc(site.brand.sign)}</a>
    <span class="topbar__spacer" aria-hidden="true"></span>
  </header>`;

/** Página /servicos/: categorias que abrem e fecham, cada serviço agenda pelo WhatsApp. */
export function ServicesPage(site) {
  const p = site.pages.servicos;
  const first = site.brand.designer.split(' ')[0];
  const groups = site.services
    .map((group, gi) => {
      const items = group.items
        .map((s) => {
          const target = resolveChannel(site, 'whatsapp', { message: `Olá, ${first}! Vim pelo seu site e quero agendar: ${s.name}.` });
          return `<li class="svc">
          <div class="svc__top">
            <h3 class="svc__name">${esc(s.name)}</h3>
            <p class="svc__price">${money(s.price)}</p>
          </div>
          <p class="svc__time">${icon('clock', { size: 15 })}${duration(s.minutes)}</p>
          ${s.description ? `<p class="svc__desc">${esc(s.description)}</p>` : ''}
          ${renderTarget(target, {
            className: 'svc__book',
            label: 'WhatsApp',
            ariaLabel: `Agendar ${s.name} pelo WhatsApp`,
            content: `${icon('whatsapp', { size: 16 })}<span>Agendar</span>`,
          })}
        </li>`;
        })
        .join('');
      return `<details class="glass svc-group reveal" style="--i:${gi + 1}"${gi === 0 ? ' open' : ''}>
        <summary class="svc-group__head">
          <span class="svc-group__title">${esc(group.category)}</span>
          <span class="svc-group__meta">${group.items.length === 1 ? '1 serviço' : `${group.items.length} serviços`}</span>
          <span class="svc-group__chev">${icon('chevronDown', { size: 20, stroke: 1.8 })}</span>
        </summary>
        <ul class="svc-list">${items}</ul>
      </details>`;
    })
    .join('');

  return `${Topbar(site)}
    <header class="glass card page-intro reveal">
      <p class="page-intro__eyebrow">${esc(p.eyebrow)}</p>
      <h1 class="page-intro__title">${esc(p.title)}</h1>
      <p class="page-intro__sub">${esc(p.subtitle)}</p>
      <div class="designer designer--dark">
        <span class="designer__photo">${Picture(site.brand.photo, { sizes: '48px' })}</span>
        <p><strong>${esc(site.brand.designer)}</strong><span>${esc(site.schedule.day)} · ${esc(site.schedule.time)}</span></p>
      </div>
    </header>
    <div class="svc-groups">${groups}</div>
    ${ContactCard(site, { i: site.services.length + 1 })}`;
}

export function Footer(site) {
  return `<footer class="footer">
    <p>© <span data-year>${new Date().getFullYear()}</span> ${esc(site.brand.name)} · ${esc(site.brand.designer)}</p>
    ${site.demo && site.footer.demoNote ? `<p class="footer__demo">${esc(site.footer.demoNote)}</p>` : ''}
  </footer>`;
}
