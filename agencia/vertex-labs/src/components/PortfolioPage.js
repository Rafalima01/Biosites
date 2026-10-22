import { esc, attrs } from '../lib/html.js';
import { T, attrI18n } from '../lib/i18n.js';
import { icon } from './icons.js';
import { WorkStage } from './Sections.js';

/** Página /portfolio/: título, filtros por categoria e todos os projetos com descrição. */
export function PortfolioPage(site) {
  const { portfolio, portfolioPage: page } = site;
  const filters = [{ id: 'all', label: page.all }, ...portfolio.categories]
    .map(
      (f, i) =>
        `<button type="button" class="chip" data-filter="${esc(f.id)}" aria-pressed="${i === 0}">${T(f.label)}</button>`,
    )
    .join('');

  const items = portfolio.items
    .map(
      (item, i) => `<li class="case reveal" data-category="${esc(item.category)}" style="--i:${i % 2}">
        ${WorkStage(item, { wide: true })}
        <div class="case__body">
          <div class="case__head">
            <h2 class="case__title">${esc(item.title)}</h2>
            <span class="case__year">${esc(item.year)}</span>
          </div>
          <p class="case__segment">${T(item.segment)} · ${T(portfolio.categories.find((c) => c.id === item.category).label)}</p>
          <p class="case__desc">${T(item.description)}</p>
          <ul class="case__tags">${item.tags.map((tag) => `<li>${T(tag)}</li>`).join('')}</ul>
        </div>
      </li>`,
    )
    .join('');

  return `<section class="pf" aria-labelledby="pf-title">
    <header class="pf__head">
      <p class="pf__eyebrow reveal">// ${T(page.eyebrow)}</p>
      <h1 class="pf__title reveal" id="pf-title" style="--i:1">${T(page.title)}</h1>
      <p class="pf__intro reveal" style="--i:2">${T(page.intro)}</p>
      <div class="chips reveal" style="--i:3" role="group" ${attrs(attrI18n('aria-label', { pt: 'Filtrar por categoria', en: 'Filter by category' }))}>${filters}</div>
    </header>
    <ul class="cases" data-cases>${items}</ul>
    <p class="pf__empty" data-empty hidden>${T(page.empty)}</p>
  </section>
  <div class="floating">
    <a class="floating__top" href="#topo" data-scroll ${attrs(attrI18n('aria-label', page.toTop))}>${icon('arrowUp', { size: 20, stroke: 2 })}</a>
    <button type="button" class="floating__quote" data-dialog="orcamento" aria-haspopup="dialog"><span class="floating__dot" aria-hidden="true"></span>${T(page.quoteButton)}</button>
  </div>`;
}
