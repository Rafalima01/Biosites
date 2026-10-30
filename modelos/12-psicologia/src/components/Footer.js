import { esc } from '../lib/html.js';
import { resolveChannel, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';

/** Rodapé: nome com Ψ e CRP, canais e direitos. */
export function Footer(site) {
  const { brand, social } = site;
  const canais = social.channels
    .map((key) => {
      const target = resolveChannel(site, key);
      return `<li>${renderTarget(target, {
        className: 'rodape__icone',
        label: target.label,
        ariaLabel: `${target.label}${target.pending ? ' (não configurado)' : ' (abre em nova aba)'}`,
        content: icon(target.icon, { size: 20 }),
      })}</li>`;
    })
    .join('');
  return `<footer class="rodape">
    <p class="rodape__marca"><span class="rodape__psi" aria-hidden="true">Ψ</span><span><strong>${esc(brand.name)}</strong><span>${esc(brand.role)} · ${esc(brand.crp)}</span></span></p>
    <div class="rodape__social">
      <p class="rodape__titulo">${esc(social.title)}</p>
      <ul class="rodape__icones">${canais}</ul>
    </div>
    <p class="rodape__copy">© <span data-year>${new Date().getFullYear()}</span> ${esc(brand.name)} · ${esc(brand.role)} · ${esc(brand.crp)}. Todos os direitos reservados.</p>
    ${site.demo && site.footer.demoNote ? `<p class="rodape__demo">${esc(site.footer.demoNote)}</p>` : ''}
  </footer>`;
}
