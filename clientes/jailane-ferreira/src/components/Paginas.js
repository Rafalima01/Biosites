import { esc } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

/** Barra do topo das páginas internas: voltar ao início + nome. */
export const Topbar = (site) =>
  `<header class="topbar">
    <a class="topbar__back" href="/" aria-label="Voltar para o início">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
    </a>
    <a class="topbar__name" href="/">${esc(site.brand.firstName)} <span>${esc(site.brand.lastName)}</span></a>
    <span class="topbar__spacer" aria-hidden="true"></span>
  </header>`;

/**
 * Página da mentoria. Enquanto `paragraphs` estiver vazio, mostra um aviso de "em breve"
 * com o botão para perguntar pelo WhatsApp (nada de conteúdo inventado).
 */
export function Mentoria(site) {
  const m = site.pages.mentoria;
  const cta = renderTarget(resolveAction(site, m.cta.action), {
    className: 'pill pill--brand',
    label: m.cta.label,
    content: `<span>${esc(m.cta.label)}</span>`,
  });
  const corpo = m.paragraphs.length
    ? m.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')
    : `<p class="mentoria__breve">${icon('calendar', { size: 20 })}<span>${esc(m.emBreve)}</span></p>`;
  return `<section class="mentoria" aria-labelledby="mentoria-title">
    <figure class="mentoria__media reveal">${Picture(m.photo, { sizes: '(min-width: 960px) 520px, 100vw', priority: true })}</figure>
    <div class="mentoria__card reveal" style="--i:1">
      <p class="section__eyebrow">${esc(m.eyebrow)}</p>
      <h1 class="mentoria__title" id="mentoria-title">${esc(m.title)}</h1>
      <div class="mentoria__body">${corpo}</div>
      <div class="mentoria__cta">${cta}</div>
    </div>
  </section>`;
}
