import { esc } from '../lib/html.js';
import { resolveAction, resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

/** Cartão 1: foto do studio com letreiro em neon e o destaque de agendamento. */
export function StudioCard(site) {
  const { brand, studio, featured, schedule, cta, inspo } = site;
  const booking = resolveChannel(site, 'whatsapp', { message: cta.message });
  const preview = inspo.items
    .slice(0, 4)
    .map((it) => `<span class="faces__item">${Picture(it.photo, { sizes: '40px' })}</span>`)
    .join('');

  return `<article class="glass card card--studio reveal" aria-labelledby="studio-title">
    <div class="studio">
      ${Picture(studio.photo, { className: 'studio__photo', sizes: '(min-width: 960px) 420px, 100vw', priority: true })}
      <button class="round-btn studio__share" type="button" data-share aria-label="Compartilhar este site">${icon('share', { size: 20 })}</button>
      <div class="studio__sign">
        <p class="neon" aria-hidden="true">${esc(brand.neon)}</p>
        <h1 class="studio__name" id="studio-title">${esc(brand.name)}</h1>
      </div>
    </div>

    <div class="featured">
      <div class="featured__photo">${Picture(featured.photo, { sizes: '160px' })}</div>
      <div class="featured__body">
        <span class="chip chip--status">${esc(featured.status)}</span>
        <p class="featured__service">${esc(featured.service)}</p>
        <p class="featured__detail">${esc(featured.detail)}</p>
        <div class="designer">
          <span class="designer__photo">${Picture(brand.photo, { sizes: '48px' })}</span>
          <p><strong>${esc(brand.designer)}</strong><span>${esc(brand.role)} · ${esc(brand.name)}</span></p>
        </div>
      </div>
    </div>

    <div class="summary">
      <div class="summary__col">
        <p class="summary__label">Inspirações escolhidas</p>
        <div class="faces" data-picked aria-live="polite">
          <span class="faces__list">${preview}</span>
          <span class="faces__more">Toque no + das fotos</span>
        </div>
      </div>
      <div class="summary__col">
        <p class="summary__label">${esc(schedule.label)}</p>
        <p class="summary__value">${esc(schedule.day)}</p>
        <p class="summary__sub">${esc(schedule.time)}</p>
      </div>
    </div>

    ${renderTarget(booking, {
      className: 'btn-pink',
      label: 'WhatsApp',
      content: `${icon('calendar', { size: 20 })}<span>${esc(cta.label)}</span>`,
      extra: { 'data-book': true, 'data-message': cta.message },
    })}
    <p class="card__note">${esc(cta.note)}</p>
  </article>`;
}

/** Cartão 2: galeria de inspirações com filtros, perfil e seleção. */
export function InspoCard(site) {
  const { inspo, brand } = site;
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

  return `<section class="glass card card--inspo reveal" style="--i:1" aria-labelledby="inspo-title">
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

/** Cartão 3: serviços com valores e links. */
export function ServicesCard(site) {
  const services = site.services
    .map((s) => `<li><span>${esc(s.name)}</span><strong>${s.from ? '<small>a partir de</small> ' : ''}${esc(s.price)}</strong></li>`)
    .join('');
  const links = site.links
    .map((l) => {
      const target = resolveAction(site, l.action);
      const iconName = l.action.type === 'channel' ? resolveChannel(site, l.action.channel).icon : 'link';
      return `<li>${renderTarget(target, {
        className: 'link-row',
        label: l.label,
        content: `<span class="link-row__icon">${icon(iconName, { size: 20 })}</span><span class="link-row__label">${esc(l.label)}</span>${icon('arrowRight', { size: 18 })}`,
      })}</li>`;
    })
    .join('');
  return `<section class="glass card card--services reveal" style="--i:2" aria-labelledby="services-title">
    <h2 class="inspo__title" id="services-title">Serviços</h2>
    <ul class="services">${services}</ul>
    <ul class="links">${links}</ul>
  </section>`;
}

export function Footer(site) {
  return `<footer class="footer">
    <p><span data-year>${new Date().getFullYear()}</span> ${esc(site.brand.name)} · ${esc(site.brand.role)} ${esc(site.brand.designer)}</p>
    ${site.demo && site.footer.demoNote ? `<p class="footer__demo">${esc(site.footer.demoNote)}</p>` : ''}
  </footer>`;
}

