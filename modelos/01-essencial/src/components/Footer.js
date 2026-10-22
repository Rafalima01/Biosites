import { esc } from '../lib/html.js';
import { resolveChannel, renderTarget } from '../lib/links.js';
import { icon, ornamentDivider } from './icons.js';

export function Footer(site) {
  const links = site.footer.links
    .map((key) => {
      const target = resolveChannel(site, key);
      return `<li>${renderTarget(target, {
        className: 'footer__link',
        ariaLabel: target.pending ? `${target.label} (não configurado)` : `${target.label} (abre em nova aba)`,
        content: icon(target.icon, { size: 22, stroke: 1.5 }),
      })}</li>`;
    })
    .join('');

  return `<footer class="footer">
    <svg class="footer__wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 46C240 8 520 0 760 22s470 44 680 6V80H0z"/></svg>
    <div class="footer__inner reveal">
      <h2 class="footer__title">${esc(site.footer.title)}</h2>
      ${ornamentDivider()}
      <ul class="footer__links" aria-label="Redes e contatos">${links}</ul>
      <p class="footer__legal"><span data-year>${new Date().getFullYear()}</span> ${esc(site.brand.legalName)}. Todos os direitos reservados.</p>
    </div>
  </footer>`;
}
