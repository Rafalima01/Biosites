import { esc } from '../lib/html.js';
import { whatsappUrl } from '../lib/links.js';
import { icon } from './icons.js';

const duration = (m) => (m % 60 === 0 ? `${m / 60} h` : m > 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
export const money = (v) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Mensagem do WhatsApp de um serviço, a partir de `pages.servicos.message`. */
export const serviceMessage = (site, s) =>
  site.pages.servicos.message.replace('{servico}', s.name).replace('{valor}', `${s.from ? 'a partir de ' : ''}${money(s.price)}`);

/** Barra do topo da página de serviços: voltar ao início + nome. */
export const Topbar = ({ brand }) =>
  `<header class="topbar">
    <a class="topbar__back" href="/" aria-label="Voltar para o início">${icon('arrowLeft', { size: 20, stroke: 1.8 })}</a>
    <a class="topbar__name" href="/">${esc(brand.firstName)} <em>${esc(brand.lastName)}</em></a>
    <span aria-hidden="true"></span>
  </header>`;

/** Página /servicos/: categorias com os serviços; tocar no serviço abre o WhatsApp com o nome dele. */
export function Services(site) {
  const p = site.pages.servicos;
  const number = site.contact.whatsapp.number;
  const groups = site.services
    .map((group, gi) => {
      const items = group.items
        .map((s) => {
          const href = whatsappUrl(number, serviceMessage(site, s));
          const inner = `<span class="svc__main">
                <span class="svc__name">${esc(s.name)}${s.tag ? ` <span class="svc__tag">${esc(s.tag)}</span>` : ''}</span>
                ${s.description ? `<span class="svc__desc">${esc(s.description)}</span>` : ''}
                <span class="svc__time">${icon('clock', { size: 14 })}${duration(s.minutes)}</span>
              </span>
              <span class="svc__side">
                <span class="svc__price">${s.from ? '<small>a partir de</small>' : ''}${money(s.price)}</span>
                <span class="svc__go">${icon('whatsapp', { size: 15 })}Agendar</span>
              </span>`;
          // Sem número configurado, o card avisa em vez de abrir um link inventado.
          return `<li>${
            href
              ? `<a class="svc" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="Agendar ${esc(s.name)}, ${esc(money(s.price))}, pelo WhatsApp (abre em nova aba)">${inner}</a>`
              : `<button type="button" class="svc" data-pending="WhatsApp: destino ainda não configurado neste modelo demonstrativo.">${inner}</button>`
          }</li>`;
        })
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
