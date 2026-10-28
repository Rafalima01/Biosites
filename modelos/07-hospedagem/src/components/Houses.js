import { esc, attrs } from '../lib/html.js';
import { brl } from '../lib/pricing.js';
import { resolveChannel, renderTarget } from '../lib/links.js';
import { houseMessage } from '../lib/messages.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const facts = (house) => `<ul class="facts">
  <li>${icon('users', { size: 17 })}${plural(house.guests, 'hóspede', 'hóspedes')}</li>
  <li>${icon('bed', { size: 17 })}${plural(house.bedrooms, 'quarto', 'quartos')}</li>
  <li>${icon('bath', { size: 17 })}${plural(house.baths, 'banheiro', 'banheiros')}</li>
</ul>`;

const pickButton = (house, label, className) =>
  `<button ${attrs({ type: 'button', class: className, 'data-pick-house': house.id })}>${label}</button>`;

function HouseCard(house, i) {
  return `<article class="house-card reveal" style="--i:${i}">
    <button class="house-card__media" type="button" data-open="${esc(house.id)}" aria-label="Ver fotos e detalhes da ${esc(house.name)}">
      ${Picture(house.photos[0], { className: 'house-card__img', sizes: '(min-width: 960px) 360px, 82vw' })}
      ${house.tag ? `<span class="pill">${esc(house.tag)}</span>` : ''}
      <span class="house-card__count">${icon('search', { size: 14 })}${house.photos.length} fotos</span>
    </button>
    <div class="house-card__body">
      <h3 class="house-card__name">${esc(house.name)}</h3>
      <p class="house-card__place">${icon('pin', { size: 15 })}${esc(house.location)}</p>
      ${facts(house)}
      <div class="house-card__foot">
        <p class="price"><span>A partir de</span><strong>${brl(house.price)}<small>/noite</small></strong></p>
        ${pickButton(house, 'Reservar', 'btn btn--primary btn--sm')}
      </div>
    </div>
  </article>`;
}

function HouseSheet(site, house) {
  const gallery = house.photos
    .map((p, i) => `<li>${Picture(p, { className: 'sheet__photo', sizes: '(min-width: 720px) 640px, 100vw', priority: i === 0 })}</li>`)
    .join('');
  const amenities = house.amenities.map((a) => `<li>${icon('check', { size: 16 })}${esc(a)}</li>`).join('');
  const ask = resolveChannel(site, 'whatsapp', { message: houseMessage(house) });
  return `<dialog class="sheet" id="sheet-${esc(house.id)}" aria-labelledby="sheet-${esc(house.id)}-title">
    <div class="sheet__panel">
      <button class="sheet__close" type="button" data-close aria-label="Fechar">${icon('close', { size: 20 })}</button>
      <ul class="sheet__gallery" aria-label="Fotos da ${esc(house.name)}">${gallery}</ul>
      <div class="sheet__body">
        <p class="eyebrow">${esc(house.location)}</p>
        <h2 class="sheet__title" id="sheet-${esc(house.id)}-title">${esc(house.name)}</h2>
        ${facts(house)}
        <p class="sheet__text">${esc(house.description)}</p>
        <h3 class="sheet__subtitle">O que a casa oferece</h3>
        <ul class="amenities">${amenities}</ul>
        <h3 class="sheet__subtitle">Valores</h3>
        <dl class="rates">
          <div><dt>Diária</dt><dd>${brl(house.price)}</dd></div>
          <div><dt>Sexta e sábado</dt><dd>${brl(house.weekendPrice ?? house.price)}</dd></div>
          <div><dt>Taxa de limpeza</dt><dd>${brl(house.cleaningFee || 0)}</dd></div>
          <div><dt>Estadia mínima</dt><dd>${plural(house.minNights || 1, 'noite', 'noites')}</dd></div>
        </dl>
      </div>
      <div class="sheet__actions">
        ${renderTarget(ask, { className: 'btn btn--ghost', label: 'WhatsApp', content: `${icon('whatsapp', { size: 18 })}Tirar dúvida` })}
        ${pickButton(house, 'Ver datas e reservar', 'btn btn--primary')}
      </div>
    </div>
  </dialog>`;
}

export const Houses = (site) => `<section class="section" id="casas" aria-labelledby="casas-title">
  <div class="section__head">
    <p class="eyebrow">Acomodações</p>
    <h2 class="section__title" id="casas-title">Escolha sua casa</h2>
  </div>
  <div class="rail">${site.houses.map(HouseCard).join('')}</div>
</section>`;

export const HouseSheets = (site) => site.houses.map((h) => HouseSheet(site, h)).join('');
