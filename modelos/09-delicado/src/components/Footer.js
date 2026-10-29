import { esc } from '../lib/html.js';
import { resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';

/** Rodapé rosa: assinatura, "Acompanhe meu trabalho" com os canais e direitos. */
export function Footer(site) {
  const { brand, social } = site;
  const channels = social.channels
    .map((key) => {
      const target = resolveChannel(site, key);
      return `<li>${renderTarget(target, {
        className: 'footer__icon',
        label: target.label,
        ariaLabel: `${target.label}${target.pending ? ' (não configurado)' : ' (abre em nova aba)'}`,
        content: icon(target.icon, { size: 20 }),
      })}</li>`;
    })
    .join('');
  return `<footer class="footer">
    <div class="footer__inner">
      <span class="signature footer__signature" aria-hidden="true">${esc(brand.signature)}</span>
      <div class="footer__social">
        <p class="footer__title">${esc(social.title)}</p>
        <ul class="footer__icons">${channels}</ul>
      </div>
    </div>
    <p class="footer__copy">© <span data-year>${new Date().getFullYear()}</span> ${esc(brand.name)} · ${esc(brand.firstName)} ${esc(brand.lastName)}. Todos os direitos reservados.</p>
    ${site.demo && site.footer.demoNote ? `<p class="footer__demo">${esc(site.footer.demoNote)}</p>` : ''}
  </footer>`;
}
