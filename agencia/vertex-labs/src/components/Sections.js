import { esc, attrs } from '../lib/html.js';
import { T } from '../lib/i18n.js';
import { actionElement } from '../lib/actions.js';
import { icon } from './icons.js';

/** Lista numerada abaixo do orçamento: site da agência, portfólio completo e sistema sob medida. */
export function LinkList(site) {
  const items = site.links
    .map((item, i) => {
      const content = `
          <span class="link-row__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="link-row__body">
            <span class="link-row__title">${T(item.title)}</span>
            <span class="link-row__text">${T(item.text)}</span>
          </span>
          <span class="link-row__arrow" aria-hidden="true">${icon('arrowUpRight', { size: 18, stroke: 2 })}</span>`;
      return `<li class="reveal" style="--i:${i}">${actionElement(site, item.action, { className: 'link-row', content })}</li>`;
    })
    .join('');
  return `<nav class="section section--links" aria-label="Links">
    <ul class="link-list">${items}</ul>
  </nav>`;
}

/** Imagem do projeto num "palco" com grade e brilho laranja (sem link: só vitrine). */
export const WorkStage = (item, { wide = false } = {}) =>
  `<span class="work__stage${wide ? ' work__stage--wide' : ''}">
    <span class="work__phone"><img ${attrs({ src: item.image, alt: `${item.title} — ${item.segment.pt}`, loading: 'lazy', decoding: 'async', width: 600, height: 1300 })}></span>
  </span>`;

/** Resumo do portfólio na página inicial, em abas por categoria, com "Ver completo". */
export function PortfolioSummary(site) {
  const { portfolio } = site;
  const byCategory = (id) => portfolio.items.filter((item) => item.category === id);

  const tabs = portfolio.categories
    .map((cat, i) => {
      const count = byCategory(cat.id).length;
      return `<button type="button" role="tab" class="tab" id="tab-${esc(cat.id)}" aria-controls="panel-${esc(cat.id)}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
        ${T(cat.label)}<span class="tab__count">${count || '—'}</span>
      </button>`;
    })
    .join('');

  const panels = portfolio.categories
    .map((cat, i) => {
      const items = byCategory(cat.id);
      const body = items.length
        ? `<ul class="works">${items
            .map(
              (item) => `<li class="work">
                ${WorkStage(item)}
                <span class="work__meta">
                  <span class="work__title">${esc(item.title)}</span>
                  <span class="work__segment">${T(item.segment)}</span>
                </span>
              </li>`,
            )
            .join('')}</ul>`
        : `<div class="soon"><span class="soon__badge">${T(site.soonLabel)}</span><p>${T(portfolio.soon)}</p></div>`;
      return `<div role="tabpanel" class="panel" id="panel-${esc(cat.id)}" aria-labelledby="tab-${esc(cat.id)}"${i === 0 ? '' : ' hidden'}>${body}</div>`;
    })
    .join('');

  return `<section class="section" id="portfolio" aria-labelledby="portfolio-title">
    <div class="section__head reveal">
      <h2 class="section__title" id="portfolio-title">${T(portfolio.title)}</h2>
      <a class="section__more" href="/portfolio/">${T(portfolio.seeAll)} ${icon('arrowRight', { size: 16, stroke: 2 })}</a>
    </div>
    <p class="section__intro reveal">${T(portfolio.intro)}</p>
    <div class="tabs reveal" role="tablist" aria-label="Categorias do portfólio">${tabs}</div>
    ${panels}
  </section>`;
}
