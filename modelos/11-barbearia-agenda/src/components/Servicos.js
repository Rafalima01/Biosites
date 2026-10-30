import { esc, slug } from '../lib/html.js';
import { icon } from './icons.js';

const duration = (m) => (m % 60 === 0 ? `${m / 60} h` : m > 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
export const money = (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Barra do topo das páginas internas: voltar ao início + nome. */
export const Topbar = ({ brand }) =>
  `<header class="topbar">
    <a class="topbar__back" href="/" aria-label="Voltar para o início">${icon('arrowLeft', { size: 20, stroke: 1.8 })}</a>
    <a class="topbar__name" href="/">${esc(brand.firstName)} <em>${esc(brand.lastName)}</em></a>
    <span aria-hidden="true"></span>
  </header>`;

/** Página /servicos/: categorias com os serviços; tocar no serviço abre o agendamento com ele escolhido. */
export function Services(site) {
  const p = site.pages.servicos;
  const groups = site.services
    .map((group, gi) => {
      const items = group.items
        .map(
          (s) => `<li><a class="svc" href="/agendar/?servico=${esc(slug(s.name))}" aria-label="Agendar ${esc(s.name)}, ${s.from ? 'a partir de ' : ''}${esc(money(s.price))}">
              <span class="svc__main">
                <span class="svc__name">${esc(s.name)}${s.tag ? ` <span class="svc__tag">${esc(s.tag)}</span>` : ''}</span>
                ${s.description ? `<span class="svc__desc">${esc(s.description)}</span>` : ''}
                <span class="svc__time">${icon('clock', { size: 14 })}${duration(s.minutes)}</span>
              </span>
              <span class="svc__side">
                <span class="svc__price">${s.from ? '<small>a partir de</small>' : ''}${money(s.price)}</span>
                <span class="svc__go">${icon('calendar', { size: 15 })}Agendar</span>
              </span>
            </a></li>`,
        )
        .join('');
      return `<section class="svc-group reveal" style="--i:${gi}" aria-labelledby="cat-${gi}">
        <h2 class="svc-group__title" id="cat-${gi}">${esc(group.category)}</h2>
        <ul class="svc-list">${items}</ul>
      </section>`;
    })
    .join('');

  const hours = site.schedule.filter((h) => !/fechado/i.test(h.time)).map((h) => `${esc(h.day)} · ${esc(h.time)}`).join('<span aria-hidden="true">  |  </span>');

  return `<section class="services" aria-labelledby="services-title">
    <header class="services__head reveal">
      <p class="head__kicker">${esc(site.brand.name)}</p>
      <h1 class="head__title head__title--big" id="services-title">${esc(p.title)} <em>${esc(p.titleAccent)}</em></h1>
      <p class="services__sub">${esc(p.subtitle)}</p>
      <p class="services__hours">${icon('clock', { size: 15 })}<span>${hours}</span></p>
    </header>
    <div class="svc-groups">${groups}</div>
  </section>`;
}
