import { esc } from '../lib/html.js';
import { brl } from '../lib/pricing.js';
import { toDay, formatFull } from '../lib/dates.js';
import { resolveChannel, renderTarget } from '../lib/links.js';
import { packageMessage } from '../lib/messages.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

export const Perks = (site) => `<section class="section perks" aria-labelledby="perks-title">
  <h2 class="section__title" id="perks-title">${esc(site.perks.title)}</h2>
  <ul class="perks__list">
    ${site.perks.items
      .map(
        (p, i) => `<li class="perk reveal" style="--i:${i}">
      <span class="perk__icon">${icon(p.icon, { size: 22 })}</span>
      <div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>
    </li>`,
      )
      .join('')}
  </ul>
</section>`;

function PackageCard(site, pkg, i) {
  const house = site.houses.find((h) => h.id === pkg.house);
  const nights = toDay(pkg.to) - toDay(pkg.from);
  const target = resolveChannel(site, 'whatsapp', { message: packageMessage(pkg, house) });
  return `<article class="package reveal" style="--i:${i}">
    <div class="package__media">
      ${Picture(pkg.photo, { className: 'package__img', sizes: '(min-width: 960px) 360px, 82vw' })}
      <span class="pill">${esc(pkg.tag)}</span>
    </div>
    <div class="package__body">
      <h3 class="package__title">${esc(pkg.title)}</h3>
      <p class="package__house">${icon('home', { size: 15 })}${esc(house.name)} · ${nights} diárias</p>
      <dl class="package__dates">
        <div><dt>Entrada</dt><dd>${formatFull(pkg.from)}</dd></div>
        <div><dt>Saída</dt><dd>${formatFull(pkg.to)}</dd></div>
      </dl>
      ${pkg.note ? `<p class="package__note">${esc(pkg.note)}</p>` : ''}
      <div class="package__foot">
        <p class="price"><span>Valor fechado</span><strong>${brl(pkg.price)}</strong></p>
        ${renderTarget(target, { className: 'btn btn--primary btn--sm', label: 'WhatsApp', content: 'Quero esse' })}
      </div>
    </div>
  </article>`;
}

export const Packages = (site) =>
  site.packages?.length
    ? `<section class="section" id="pacotes" aria-labelledby="pacotes-title">
  <div class="section__head">
    <p class="eyebrow">Datas especiais</p>
    <h2 class="section__title" id="pacotes-title">Pacotes com valor fechado</h2>
  </div>
  <div class="rail">${site.packages.map((p, i) => PackageCard(site, p, i)).join('')}</div>
</section>`
    : '';

export const Testimonials = (site) => `<section class="section testimonials" aria-labelledby="dep-title">
  <div class="section__head section__head--center">
    <p class="eyebrow">Depoimentos</p>
    <h2 class="section__title" id="dep-title">Quem se hospeda quer voltar</h2>
    <p class="rating">${Array(5).fill(icon('star', { size: 18 })).join('')}<span>${esc(site.hero.stats.find((s) => /avalia/.test(s.label))?.value || '5,0')} de média</span></p>
  </div>
  <ul class="rail rail--quotes">
    ${site.testimonials
      .map(
        (t) => `<li class="quote">
      ${icon('quote', { size: 26, className: 'quote__mark' })}
      <blockquote>${esc(t.quote)}</blockquote>
      <p class="quote__who"><strong>${esc(t.name)}</strong><span>${esc(t.origin)}</span></p>
    </li>`,
      )
      .join('')}
  </ul>
</section>`;

export const Faq = (site) => `<section class="section" id="duvidas" aria-labelledby="faq-title">
  <div class="section__head">
    <p class="eyebrow">Perguntas frequentes</p>
    <h2 class="section__title" id="faq-title">Tudo o que você precisa saber antes de reservar</h2>
  </div>
  <div class="faq">
    ${site.faq
      .map(
        (f) => `<details class="faq__item">
      <summary>${esc(f.q)}${icon('chevronDown', { size: 20 })}</summary>
      <p>${esc(f.a)}</p>
    </details>`,
      )
      .join('')}
  </div>
</section>`;

export function Contact(site) {
  const wa = resolveChannel(site, 'whatsapp');
  const loc = resolveChannel(site, 'location');
  return `<section class="section contact reveal" aria-labelledby="contato-title">
  <h2 class="section__title" id="contato-title">Ficou com alguma dúvida?</h2>
  <p>Fale direto com o anfitrião. Respondemos rápido, todos os dias.</p>
  <div class="contact__actions">
    ${renderTarget(wa, { className: 'btn btn--light', content: `${icon('whatsapp', { size: 20 })}Chamar no WhatsApp` })}
    ${renderTarget(loc, { className: 'btn btn--outline-light', content: `${icon('pin', { size: 20 })}${esc(site.brand.region)}` })}
  </div>
</section>`;
}

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
    <p class="footer__brand"><strong>${esc(site.brand.name)}</strong> · ${esc(site.brand.tagline)}</p>
    ${links ? `<ul class="footer__links" aria-label="Redes e contatos">${links}</ul>` : ''}
    <p class="footer__legal"><span data-year>${new Date().getFullYear()}</span> ${esc(site.brand.legalName)}. Todos os direitos reservados.</p>
    ${site.demo && site.footer.demoNote ? `<p class="footer__demo">${esc(site.footer.demoNote)}</p>` : ''}
  </footer>`;
}
