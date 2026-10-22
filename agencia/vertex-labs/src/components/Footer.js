import { esc, attrs } from '../lib/html.js';
import { T } from '../lib/i18n.js';
import { resolveChannel } from '../lib/links.js';
import { icon } from './icons.js';
import { Lockup } from './Brand.js';
import { Socials, whatsappAttrs } from './Profile.js';

export function Footer(site) {
  const instagram = resolveChannel(site, 'instagram');
  return `<footer class="footer reveal">
    ${Lockup(site, { size: 'sm' })}
    <p class="footer__tagline">${T(site.footer.tagline)}</p>
    ${Socials(site, 'socials socials--start')}
    <div class="footer__buttons">
      <a ${attrs({ class: 'pill-link', ...whatsappAttrs(site, site.cta.message) })}>${T(site.cta.title)} ${icon('arrowUpRight', { size: 16, stroke: 2 })}</a>
      <a class="pill-link" href="#portfolio" data-scroll>${T(site.portfolio.title)} ${icon('arrowUpRight', { size: 16, stroke: 2 })}</a>
    </div>
    <div class="footer__legal">
      <span>© <span data-year>${new Date().getFullYear()}</span> ${esc(site.brand.legalName)}</span>
      ${instagram.pending ? '' : `<a href="${esc(instagram.href)}" target="_blank" rel="noopener noreferrer">${esc(site.brand.handle)}</a>`}
    </div>
  </footer>`;
}
