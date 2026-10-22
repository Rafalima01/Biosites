import { esc } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { stars } from './icons.js';
import { Picture } from './Picture.js';

const Cta = (site, cta, className = 'pill pill--brand') =>
  cta
    ? renderTarget(resolveAction(site, cta.action), {
        className,
        label: cta.label,
        content: `<span>${esc(cta.label)}</span>`,
      })
    : '';

export const About = ({ about }) =>
  `<section class="about" id="${esc(about.id)}" aria-labelledby="${esc(about.id)}-title">
    <div class="about__panel reveal">
      <h2 class="about__title" id="${esc(about.id)}-title" tabindex="-1">
        <span class="light">${esc(about.titleLead)}</span> ${esc(about.title)}
      </h2>
      ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
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
