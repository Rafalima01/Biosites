import { esc } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { Picture } from './Picture.js';

const Cta = (site, cta, className = 'btn btn--navy') =>
  cta
    ? renderTarget(resolveAction(site, cta.action), {
        className,
        label: cta.label,
        content: `<span>${esc(cta.label)}</span>`,
      })
    : '';

export const About = ({ about }) =>
  `<section class="about" id="${esc(about.id)}" aria-labelledby="${esc(about.id)}-title">
    <div class="about__inner">
      <div class="about__text reveal">
        <h2 class="about__title" id="${esc(about.id)}-title" tabindex="-1">
          <span class="about__lead">${esc(about.titleLead)}</span> ${esc(about.title)}
        </h2>
        ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      </div>
      ${about.photo ? `<figure class="about__media">${Picture(about.photo, { sizes: '(min-width: 960px) 50vw, 100vw' })}</figure>` : ''}
    </div>
  </section>`;

export function Services(site) {
  const { services } = site;
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

export function Faq(site) {
  const f = site.faq;
  return `<section class="faq" aria-labelledby="faq-title">
    <div class="faq__card reveal">
      <h2 class="faq__title" id="faq-title">${esc(f.titleLead)}<br><em>${esc(f.titleItalic)}</em></h2>
      <p class="faq__text">${esc(f.text)}</p>
      ${Cta(site, f.cta, 'btn btn--navy btn--caps')}
    </div>
  </section>`;
}
