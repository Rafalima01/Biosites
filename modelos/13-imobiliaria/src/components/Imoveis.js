import { esc } from '../lib/html.js';
import { whatsappUrl } from '../lib/links.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

/** Mensagem do WhatsApp de um imóvel, a partir de `pages.imoveis.message` ({imovel} = código + nome). */
export const propertyMessage = (site, p) => site.pages.imoveis.message.replace('{imovel}', `${p.code} · ${p.title}`);

/** Barra do topo da página interna: voltar ao início + nome. */
export const Topbar = ({ brand }) =>
  `<header class="topbar">
    <a class="topbar__voltar" href="/" aria-label="Voltar para o início">${icon('arrowLeft', { size: 20, stroke: 1.8 })}</a>
    <a class="topbar__nome" href="/">${icon('house', { size: 20, stroke: 1.8 })} ${esc(brand.name)}</a>
    <span aria-hidden="true"></span>
  </header>`;

const Dado = (nome, valor, rotulo) => `<li>${icon(nome, { size: 16 })}<span>${esc(valor)}</span><span class="sr-only">${esc(rotulo)}</span></li>`;

/** Página /imoveis/ (catálogo): tocar no imóvel abre o WhatsApp com o código e o nome dele. */
export function Properties(site) {
  const pg = site.pages.imoveis;
  const number = site.contact.whatsapp.number;
  const cards = site.properties
    .map((p, i) => {
      const href = whatsappUrl(number, propertyMessage(site, p));
      const miolo = `<span class="imovel__foto">${Picture(p.photo, { sizes: '(min-width: 760px) 340px, 100vw' })}<span class="imovel__negocio imovel__negocio--${p.deal === 'Venda' ? 'venda' : 'locacao'}">${esc(p.deal)}</span></span>
          <span class="imovel__corpo">
            <span class="imovel__codigo">${esc(p.code)}</span>
            <span class="imovel__titulo">${esc(p.title)}</span>
            <span class="imovel__local">${icon('pin', { size: 15 })}${esc(p.place)}</span>
            <ul class="imovel__dados">
              ${Dado('bed', p.beds, 'quartos')}${Dado('bath', p.baths, 'banheiros')}${Dado('car', p.parking, 'vagas')}${Dado('area', `${p.area} m²`, 'de área')}
            </ul>
            <span class="imovel__rodape"><span class="imovel__preco">${esc(p.price)}</span><span class="imovel__ir">${icon('whatsapp', { size: 15 })}Quero saber mais</span></span>
          </span>`;
      const rotulo = `${p.title}, ${p.place}, ${p.price}: pedir informações pelo WhatsApp`;
      return `<li class="reveal" style="--i:${i}">${
        href
          ? `<a class="imovel" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(rotulo)} (abre em nova aba)">${miolo}</a>`
          : `<button type="button" class="imovel" data-pending="WhatsApp: destino ainda não configurado neste modelo demonstrativo.">${miolo}</button>`
      }</li>`;
    })
    .join('');

  return `<section class="imoveis" aria-labelledby="imoveis-titulo">
    <header class="imoveis__topo reveal">
      <p class="head__kicker">${esc(site.brand.role)} · ${esc(site.brand.creci)}</p>
      <h1 class="head__titulo head__titulo--grande" id="imoveis-titulo">${esc(pg.title)} <em>${esc(pg.titleAccent)}</em></h1>
      <p class="imoveis__sub">${esc(pg.subtitle)}</p>
    </header>
    <ul class="imoveis__lista">${cards}</ul>
  </section>`;
}
