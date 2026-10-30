import { esc, rich } from '../lib/html.js';
import { resolveAction, resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

/** Elemento 3D decorativo (imagem sem fundo em /media; sem extensão = .png de 256 px). */
const Art = (nome, classe, [w, h] = [256, 256]) =>
  `<img class="art ${classe}" src="/media/${nome.includes('.') ? nome : `${nome}.png`}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">`;
const Margarida = (classe, variante = 1) => Art(variante === 1 ? 'margarida.webp' : 'margarida-2.webp', `art--margarida ${classe}`, variante === 1 ? [260, 287] : [260, 294]);

/** Card de abertura (bege): foto, Ψ grande ao fundo, nome com CRP, título e botão de agendar. */
export function Intro(site) {
  const { brand, intro } = site;
  const target = resolveAction(site, intro.action);
  return `<header class="card card--intro reveal">
    <span class="card__psi" aria-hidden="true">Ψ</span>
    <div class="intro__photo">${Picture(intro.photo, { sizes: '(min-width: 560px) 220px, 42vw', priority: true })}</div>
    <div class="intro__body">
      <div class="intro__marca"><span class="intro__simbolo" aria-hidden="true">Ψ</span>
        <span><h1 class="intro__nome">${esc(brand.name)}</h1><span class="intro__papel">${esc(brand.role)} · ${esc(brand.crp)}</span></span></div>
      <p class="intro__titulo">${esc(intro.title)}</p>
      ${renderTarget(target, {
        className: 'botao botao--escuro',
        label: intro.button,
        content: `${icon('calendar', { size: 22, stroke: 1.6 })}<span>${esc(intro.button)}</span>`,
      })}
    </div>
    ${Art('balao', 'art--balao1')}${Art('coracao', 'art--coracao1')}
    ${Art('balao', 'art--balao2')}${Art('coracao', 'art--coracao2')}
  </header>`;
}

/** Card "Saúde Mental" (bege): frase enorme com o cérebro realista na frente e margaridas saindo do card. */
export function Therapies(site) {
  const { therapies: t } = site;
  const target = resolveAction(site, t.action);
  return renderTarget(target, {
    className: 'card card--terapias reveal',
    label: t.title,
    content: `<span class="terapias__frase" aria-hidden="true"><span>${esc(t.big[0])}</span><span>${esc(t.big[1])}</span></span>
      ${Art('cerebro-real.webp', 'art--cerebro', [440, 436])}
      ${Margarida('art--margarida1')}${Margarida('art--margarida2', 2)}${Margarida('art--margarida3', 2)}
      <span class="card__texto">
        <span class="card__titulo">${esc(t.title)}</span>
        <span class="card__apoio">${rich(t.text)}</span>
      </span>`,
  });
}

/** Card do Instagram: faixa bege com o cérebro realista na mão, painel azul, selo saindo do card e papel rasgado. */
export function Content(site) {
  const { content: c } = site;
  const target = resolveAction(site, c.action);
  return renderTarget(target, {
    className: 'card card--conteudo reveal',
    label: c.title,
    content: `<span class="card__fundo" aria-hidden="true"><span class="conteudo__painel"></span>${Art('cerebro-mao.webp', 'art--cerebro-mao', [520, 500])}</span>
      <span class="selo">${Art('carinha-mao', 'art--selo')}<span>${c.badge.map(esc).join('<br>')}</span></span>
      <span class="card__texto">
        <span class="card__titulo card__titulo--display">${esc(c.title)}</span>
        <span class="papel-real papel-real--faixa">${esc(c.text)}</span>
      </span>`,
  });
}

/** Card da localização: cérebro em traço ao fundo, bilhete com esboço preso por tachinha e o horário em papel rasgado. */
export function Place(site) {
  const { place: p } = site;
  const target = resolveAction(site, p.action);
  return renderTarget(target, {
    className: 'card card--azul card--local reveal',
    label: p.title,
    content: `<span class="card__fundo" aria-hidden="true"><span class="local__traco"></span></span>
      <span class="bilhete" aria-hidden="true"><span class="bilhete__esboco"></span>${Art('tachinha-real.webp', 'art--tachinha', [96, 154])}</span>
      <span class="papel-real papel-real--nota">${esc(p.note)} <b>${esc(p.hour)}</b></span>
      ${Art('sorriso', 'art--sorriso1')}${Art('sorriso', 'art--sorriso2')}
      <span class="card__texto">
        <span class="card__titulo card__titulo--display">${esc(p.title)}</span>
        <span class="card__apoio card__apoio--claro">${esc(p.text)}</span>
      </span>`,
  });
}

/** Cards da coluna principal. */
export const Cards = (site) => `<nav class="cards" aria-label="Links principais">
    ${Therapies(site)}
    ${Content(site)}
    ${Place(site)}
  </nav>`;

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
    ${Margarida('art--flor-cta')}
    <h2 class="cta__titulo" id="cta-titulo">${esc(cta.title)}</h2>
    <p class="cta__texto">${esc(cta.text)}</p>
    ${renderTarget(target, { className: 'botao botao--escuro botao--grande', label: cta.label, content: `${icon('whatsapp', { size: 20 })}<span>${esc(cta.label)}</span>` })}
  </section>`;
}
