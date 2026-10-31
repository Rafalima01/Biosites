import { esc, rich } from '../lib/html.js';
import { resolveAction, resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

/** Imagem decorativa sem fundo em /media (recortes e ícones 3D). */
const Art = (arquivo, classe, [w, h] = [256, 256]) =>
  `<img class="art ${classe}" src="/media/${arquivo}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">`;

/** Título em linhas (cada item do array numa linha; o último pode ter cor de destaque). */
const Linhas = (linhas) => linhas.map((l) => `<span>${esc(l)}</span>`).join('');

/** Topo: foto do corretor num círculo com anel colorido, nome, CRECI, frase e botão do WhatsApp. */
export function Intro(site) {
  const { brand, intro } = site;
  const target = resolveAction(site, intro.action);
  return `<header class="topo reveal">
    <div class="topo__foto"><img src="${esc(intro.photo.src)}" alt="${esc(intro.photo.alt)}" width="${intro.photo.width}" height="${intro.photo.height}" fetchpriority="high" decoding="async"></div>
    <div class="topo__texto">
      <p class="topo__papel">${esc(brand.role)}</p>
      <h1 class="topo__nome">${esc(brand.name)}</h1>
      <p class="topo__creci">${esc(brand.creci)}</p>
    </div>
    <p class="topo__titulo">${esc(intro.title)}</p>
    <p class="topo__frase">${esc(intro.text)}</p>
    ${renderTarget(target, { className: 'botao botao--verde topo__botao', label: intro.button, content: `${icon('whatsapp', { size: 20 })}<span>${esc(intro.button)}</span>` })}
  </header>`;
}

/** Card genérico: link (ou botão pendente) com o conteúdo dado. */
const Card = (site, c, classe, conteudo) =>
  renderTarget(resolveAction(site, c.action), { className: `card ${classe} reveal`, label: c.label || c.title.join(' '), content: conteudo });

/** 1. Consultoria (azul): corretor recortado segurando a casinha, saindo pelo topo, e coração 3D. */
const Consultoria = (site, c) =>
  Card(site, c, 'card--consultoria', `<span class="recorte recorte--casa" aria-hidden="true">${Art('corretor-casa.webp', 'recorte__img', [560, 1065])}</span>
      ${Art('coracao-azul.png', 'art--coracao')}
      <span class="card__texto">
        <span class="card__titulo card__titulo--destaque">${Linhas(c.title)}</span>
        <span class="card__apoio">${rich(c.text)}</span>
      </span>`);

/** 2. Catálogo (laranja + azul): casa na ilha de grama no painel laranja e escudo 3D. */
const Catalogo = (site, c) =>
  Card(site, c, 'card--catalogo', `<span class="card__fundo" aria-hidden="true"><span class="catalogo__painel"></span></span>
      ${Art('casa-ilha.webp', 'art--casa-ilha', [640, 479])}
      ${Art('escudo.webp', 'art--escudo', [220, 222])}
      <span class="card__texto">
        <span class="card__titulo">${Linhas(c.title)}</span>
        <span class="card__apoio">${rich(c.text)}</span>
      </span>`);

/** 3. Contato (cinza): corretor ao telefone saindo pelo topo, selos 3D do WhatsApp e ícone ao lado do título. */
const Contato = (site, c) =>
  Card(site, c, 'card--contato', `<span class="recorte recorte--telefone" aria-hidden="true">${Art('corretor-telefone.webp', 'recorte__img', [600, 595])}</span>
      ${Art('whatsapp-3d.webp', 'art--zap1', [200, 200])}${Art('whatsapp-3d.webp', 'art--zap2', [200, 200])}
      <span class="card__texto">
        <span class="card__titulo">${Linhas(c.title)}<span class="contato__icone">${icon('whatsapp', { size: 40, stroke: 1.9 })}</span></span>
        <span class="card__apoio">${rich(c.text)}</span>
      </span>`);

/** 4. Visitas (claro): casa recortada saindo pelo topo, chave 3D e foto aérea clarinha ao fundo. */
const Visitas = (site, c) =>
  Card(site, c, 'card--visitas', `<span class="card__fundo" aria-hidden="true">${Picture(site.visitsBackground, { className: 'visitas__aerea', sizes: '300px' })}</span>
      ${Art('casa-branca.webp', 'art--casa-branca', [700, 322])}
      ${Art('chave.png', 'art--chave')}
      <span class="visitas__legenda">${rich(c.text)}</span>
      <span class="card__texto">
        <span class="card__titulo card__titulo--grande">${Linhas(c.title)}</span>
      </span>`);

/** Os quatro cards do print, na ordem. */
export const Cards = (site) => {
  const { consultoria, catalogo, contato, visitas } = site.cards;
  return `<nav class="cards" aria-label="Links principais">
    ${Consultoria(site, consultoria)}
    ${Catalogo(site, catalogo)}
    ${Contato(site, contato)}
    ${Visitas(site, visitas)}
  </nav>`;
};

/** Cabeçalho das seções: rótulo + título com destaque. */
const Head = ({ id, kicker, title, accent }) => `<header class="head">
    <p class="head__kicker">${esc(kicker)}</p>
    <h2 class="head__titulo" id="${esc(id)}" tabindex="-1">${esc(title)}${accent ? ` <em>${esc(accent)}</em>` : ''}</h2>
  </header>`;

/** Sobre mim: foto, texto e temas atendidos. */
export function About({ about }) {
  return `<section class="painel sobre reveal" id="${esc(about.id)}" aria-labelledby="sobre-titulo">
    <div class="sobre__foto">${Picture(about.photo, { sizes: '(min-width: 960px) 220px, 40vw' })}</div>
    <div class="sobre__texto">
      ${Head({ id: 'sobre-titulo', kicker: about.kicker, title: about.title, accent: about.titleAccent })}
      ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
    </div>
    <ul class="temas" aria-label="Temas que atendo">${about.topics.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
  </section>`;
}

/** Como funciona: três passos. */
export function Steps({ steps }) {
  const items = steps.items
    .map((s) => `<li class="passo"><span class="passo__n">${esc(s.n)}</span><span><strong>${esc(s.title)}</strong><span>${esc(s.text)}</span></span></li>`)
    .join('');
  return `<section class="painel passos reveal" aria-labelledby="passos-titulo">
    ${Head({ id: 'passos-titulo', kicker: steps.kicker, title: steps.title })}
    <ol class="passos__lista">${items}</ol>
  </section>`;
}

/** Atendimento online e presencial: endereço, horários e mapa. */
export function Local(site) {
  const { local, schedule } = site;
  const mapa = resolveChannel(site, 'location');
  const horas = schedule
    .map((h) => `<li><span>${esc(h.day)}</span><span class="${/fechado/i.test(h.time) ? 'fechado' : ''}">${esc(h.time)}</span></li>`)
    .join('');
  return `<section class="painel local reveal" id="${esc(local.id)}" aria-labelledby="local-titulo">
    ${Head({ id: 'local-titulo', kicker: local.kicker, title: local.title })}
    <div class="local__grade">
      <div>
        <h3 class="local__rotulo">${icon('pin', { size: 16 })}Presencial</h3>
        <p>${esc(local.address)}</p>
        ${renderTarget(mapa, { className: 'botao botao--linha', label: 'Abrir no mapa', content: `<span>Abrir no mapa</span>${icon('chevronRight', { size: 15 })}` })}
      </div>
      <div>
        <h3 class="local__rotulo">${icon('globe', { size: 16 })}Online</h3>
        <p>${esc(local.online)}</p>
      </div>
      <div>
        <h3 class="local__rotulo">${icon('clock', { size: 16 })}Horários</h3>
        <ul class="horas">${horas}</ul>
      </div>
    </div>
  </section>`;
}

/** Chamada final para o WhatsApp. */
export function Cta(site) {
  const { cta } = site;
  const target = resolveAction(site, cta.action);
  return `<section class="cta reveal" aria-labelledby="cta-titulo">
    ${Art('chave.png', 'art--chave-cta')}
    <h2 class="cta__titulo" id="cta-titulo">${esc(cta.title)}</h2>
    <p class="cta__texto">${esc(cta.text)}</p>
    ${renderTarget(target, { className: 'botao botao--escuro botao--grande', label: cta.label, content: `${icon('whatsapp', { size: 20 })}<span>${esc(cta.label)}</span>` })}
  </section>`;
}
