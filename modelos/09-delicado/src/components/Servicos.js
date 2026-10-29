import { esc, slug } from '../lib/html.js';
import { icon } from './icons.js';

const duration = (m) => (m % 60 === 0 ? `${m / 60} h` : m > 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
const money = (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Barra do topo da página de serviços: voltar ao início + nome. */
export const Topbar = ({ brand }) =>
  `<header class="topbar">
    <a class="topbar__back" href="/" aria-label="Voltar para o início">${icon('arrowLeft', { size: 20, stroke: 1.6 })}</a>
    <a class="topbar__name" href="/">${esc(brand.firstName)} <em>${esc(brand.lastName)}</em></a>
    <span aria-hidden="true"></span>
  </header>`;

/** Página /servicos/: categorias que abrem e fecham; o card inteiro de cada serviço abre o agendamento. */
export function Services(site) {
  const p = site.pages.servicos;
  const groups = site.services
    .map((group, gi) => {
      const items = group.items
        .map(
          (s) => `<li class="svc">
            <div class="svc__top">
              <h3 class="svc__name">${esc(s.name)}</h3>
              <p class="svc__price">${money(s.price)}</p>
            </div>
            <p class="svc__time">${icon('clock', { size: 15 })}${duration(s.minutes)}</p>
            ${s.description ? `<p class="svc__desc">${esc(s.description)}</p>` : ''}
            <a class="svc__book" href="/agendar/?servico=${esc(slug(s.name))}" aria-label="Agendar ${esc(s.name)}"><span>Agendar</span>${icon('calendar', { size: 16 })}</a>
          </li>`,
        )
        .join('');
      return `<details class="svc-group reveal" style="--i:${gi}"${gi === 0 ? ' open' : ''}>
        <summary class="svc-group__head">
          <span class="svc-group__title">${esc(group.category)}</span>
          <span class="svc-group__count">${group.items.length === 1 ? '1 serviço' : `${group.items.length} serviços`}</span>
          ${icon('chevronDown', { size: 18, stroke: 1.6, className: 'svc-group__chev' })}
        </summary>
        <ul class="svc-list">${items}</ul>
      </details>`;
    })
    .join('');

  return `<section class="services" aria-labelledby="services-title">
    <header class="services__head reveal">
      <span class="signature services__signature" aria-hidden="true">${esc(site.brand.signature)}</span>
      <h1 class="title" id="services-title">${esc(p.title)} <em>${esc(p.titleAccent)}</em></h1>
      <p class="services__sub">${esc(p.subtitle)}</p>
      <p class="services__hours">${icon('clock', { size: 15 })}${esc(site.schedule.day)} · ${esc(site.schedule.time)}</p>
    </header>
    <div class="svc-groups">${groups}</div>
  </section>`;
}
