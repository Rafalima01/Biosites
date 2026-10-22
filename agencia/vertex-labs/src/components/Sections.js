import { esc, attrs } from '../lib/html.js';
import { T } from '../lib/i18n.js';
import { icon } from './icons.js';
import { whatsappAttrs } from './Profile.js';

const SectionHead = (title, index, intro) =>
  `<div class="section__head reveal">
    <h2 class="section__title">${T(title)}</h2>
    <span class="section__index" aria-hidden="true">// ${String(index).padStart(2, '0')}</span>
  </div>
  ${intro ? `<p class="section__intro reveal">${T(intro)}</p>` : ''}`;

export function Services(site) {
  const { services } = site;
  const items = services.items
    .map(
      (item, i) => `<li class="reveal" style="--i:${i}">
        <a ${attrs({ class: 'service', ...whatsappAttrs(site, item.message) })}>
          <span class="service__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="service__body">
            <span class="service__title">${icon(item.icon, { size: 18, stroke: 1.8 })}${T(item.title)}</span>
            <span class="service__text">${T(item.text)}</span>
          </span>
          <span class="service__arrow" aria-hidden="true">${icon('arrowUpRight', { size: 18, stroke: 2 })}</span>
        </a>
      </li>`,
    )
    .join('');
  return `<section class="section" id="servicos" aria-labelledby="servicos-title">
    ${SectionHead(services.title, 1).replace('class="section__title"', 'class="section__title" id="servicos-title"')}
    <ul class="services">${items}</ul>
  </section>`;
}

function PortfolioItem(portfolio, item) {
  return `<li class="work">
    <a class="work__link" href="${esc(item.href)}" target="_blank" rel="noopener noreferrer">
      <span class="work__stage">
        <span class="work__phone"><img ${attrs({ src: item.image, alt: `Bio site ${item.title}`, loading: 'lazy', decoding: 'async', width: 600, height: 1298 })}></span>
      </span>
      <span class="work__meta">
        <span class="work__title">${esc(item.title)}</span>
        <span class="work__segment">${T(item.segment)}</span>
      </span>
      <span class="work__visit">${T(portfolio.visit)} ${icon('arrowUpRight', { size: 14, stroke: 2 })}</span>
    </a>
  </li>`;
}

export function Portfolio(site) {
  const { portfolio } = site;
  const tabs = portfolio.categories
    .map(
      (cat, i) => `<button type="button" role="tab" class="tab" id="tab-${esc(cat.id)}" aria-controls="panel-${esc(cat.id)}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab>
        ${T(cat.label)}<span class="tab__count">${cat.items.length || '—'}</span>
      </button>`,
    )
    .join('');
  const panels = portfolio.categories
    .map(
      (cat, i) => `<div role="tabpanel" class="panel" id="panel-${esc(cat.id)}" aria-labelledby="tab-${esc(cat.id)}"${i === 0 ? '' : ' hidden'}>
        ${
          cat.items.length
            ? `<ul class="works">${cat.items.map((item) => PortfolioItem(portfolio, item)).join('')}</ul>`
            : `<div class="soon"><span class="soon__badge">${T({ pt: 'Em breve', en: 'Coming soon' })}</span><p>${T(portfolio.soon)}</p></div>`
        }
      </div>`,
    )
    .join('');
  return `<section class="section" id="portfolio" aria-labelledby="portfolio-title">
    ${SectionHead(portfolio.title, 2, portfolio.intro).replace('class="section__title"', 'class="section__title" id="portfolio-title"')}
    <div class="tabs reveal" role="tablist" aria-label="Categorias do portfólio">${tabs}</div>
    ${panels}
  </section>`;
}
