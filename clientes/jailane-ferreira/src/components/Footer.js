import { esc } from '../lib/html.js';
import { resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';

export function Footer(site) {
  const links = site.footer.links
    .map((key) => {
      const target = resolveChannel(site, key);
      return `<li>${renderTarget(target, {
        className: 'footer__link',
        ariaLabel: target.pending ? `${target.label} (não configurado)` : `${target.label} (abre em nova aba)`,
        content: icon(target.icon, { size: 20 }),
      })}</li>`;
    })
    .join('');

  return `<footer class="footer">
    ${links ? `<ul class="footer__links" aria-label="Redes e contatos">${links}</ul>` : ''}
    <p class="footer__legal">Copyright © <span data-year>${new Date().getFullYear()}</span> • ${esc(site.brand.legalName)}</p>
    <p class="footer__rights">Todos os direitos reservados</p>
    ${site.demo && site.footer.demoNote ? `<p class="footer__demo">${esc(site.footer.demoNote)}</p>` : ''}
  </footer>`;
}
