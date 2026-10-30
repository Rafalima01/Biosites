import { esc } from '../lib/html.js';
import { whatsappUrl } from '../lib/links.js';
import { icon } from './icons.js';

const duration = (m) => (m % 60 === 0 ? `${m / 60} h` : m > 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);

/** Mensagem do WhatsApp de um atendimento, a partir de `pages.servicos.message`. */
export const serviceMessage = (site, s) => site.pages.servicos.message.replace('{servico}', s.name);

/** Barra do topo da página interna: voltar ao início + nome. */
export const Topbar = ({ brand }) =>
  `<header class="topbar">
    <a class="topbar__voltar" href="/" aria-label="Voltar para o início">${icon('arrowLeft', { size: 20, stroke: 1.8 })}</a>
    <a class="topbar__nome" href="/"><span aria-hidden="true">Ψ</span> ${esc(brand.name)}</a>
    <span aria-hidden="true"></span>
  </header>`;

/**
 * Página /servicos/ (atendimentos). Sem valores, como pede o Código de Ética do Psicólogo (o preço não
 * pode ser usado como propaganda): tocar no atendimento abre o WhatsApp com o nome dele.
 */
export function Services(site) {
  const p = site.pages.servicos;
  const number = site.contact.whatsapp.number;
  const grupos = site.services
    .map((g, gi) => {
      const itens = g.items
        .map((s) => {
          const href = whatsappUrl(number, serviceMessage(site, s));
          const miolo = `<span class="svc__main">
                <span class="svc__nome">${esc(s.name)}${s.tag ? ` <span class="svc__tag">${esc(s.tag)}</span>` : ''}</span>
                ${s.description ? `<span class="svc__desc">${esc(s.description)}</span>` : ''}
                <span class="svc__tempo">${icon('clock', { size: 14 })}${duration(s.minutes)}</span>
              </span>
              <span class="svc__ir">${icon('whatsapp', { size: 15 })}Conversar</span>`;
          return `<li>${
            href
              ? `<a class="svc" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="Conversar sobre ${esc(s.name)} pelo WhatsApp (abre em nova aba)">${miolo}</a>`
              : `<button type="button" class="svc" data-pending="WhatsApp: destino ainda não configurado neste modelo demonstrativo.">${miolo}</button>`
          }</li>`;
        })
        .join('');
      return `<section class="svc-grupo reveal" style="--i:${gi}" aria-labelledby="cat-${gi}">
        <h2 class="svc-grupo__titulo" id="cat-${gi}">${esc(g.category)}</h2>
        <ul class="svc-lista">${itens}</ul>
      </section>`;
    })
    .join('');

  return `<section class="servicos" aria-labelledby="servicos-titulo">
    <header class="servicos__topo reveal">
      <p class="head__kicker">${esc(site.brand.role)} · ${esc(site.brand.crp)}</p>
      <h1 class="head__titulo head__titulo--grande" id="servicos-titulo">${esc(p.title)} <em>${esc(p.titleAccent)}</em></h1>
      <p class="servicos__sub">${esc(p.subtitle)}</p>
    </header>
    <div class="svc-grupos">${grupos}</div>
  </section>`;
}
