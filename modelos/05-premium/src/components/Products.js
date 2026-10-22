import { esc, rich } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { Picture } from './Picture.js';

const sparkle = `<svg class="product__sparkle" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20 0l2.6 17.4L40 20l-17.4 2.6L20 40l-2.6-17.4L0 20l17.4-2.6z"/></svg>`;

function Product(site, item, index) {
  const target = resolveAction(site, item.action);
  const content = `
      ${sparkle}
      <span class="product__media">${Picture(item.image, { sizes: '(min-width: 960px) 340px, 42vw' })}</span>
      <span class="product__body">
        <span class="product__title">${esc(item.title)}</span>
        <span class="product__desc">${rich(item.description)}</span>
        <span class="product__cta" aria-hidden="true">${esc(item.cta)}</span>
      </span>`;
  return `<li class="reveal" style="--i:${index}">${renderTarget(target, {
    className: `product product--${item.side === 'right' ? 'right' : 'left'}`,
    label: item.title,
    content,
    extra: { 'data-card': item.id },
  })}</li>`;
}

export const Products = (site) =>
  `<nav class="products" aria-label="Produtos">
    <ul class="products__list">${site.products.map((p, i) => Product(site, p, i)).join('')}</ul>
  </nav>`;
