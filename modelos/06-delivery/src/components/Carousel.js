import { esc } from '../lib/html.js';
import { icon } from './icons.js';
import { Picture } from './Picture.js';

/** Carrossel de sabores (comportamento em behaviors/carousel.js; funciona por rolagem sem JS). */
export function Carousel({ slides }) {
  const items = slides
    .map(
      (slide, i) => `<li class="slide" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${slides.length}: ${esc(slide.title)}">
        ${Picture(slide.image, { className: 'slide__photo', sizes: '(min-width: 960px) 50vw, 100vw', priority: i === 0 })}
        <div class="slide__caption">
          <p class="slide__title">${esc(slide.title)}</p>
          ${slide.tag ? `<span class="slide__tag">${esc(slide.tag)}</span>` : ''}
        </div>
      </li>`,
    )
    .join('');
  const dots = slides
    .map(
      (slide, i) =>
        `<button type="button" class="carousel__dot" data-goto="${i}" aria-label="Mostrar ${esc(slide.title)}"${i === 0 ? ' aria-current="true"' : ''}></button>`,
    )
    .join('');

  return `<section class="carousel" aria-roledescription="carrossel" aria-label="Sabores da casa" data-carousel>
    <ul class="carousel__track" data-track tabindex="0">${items}</ul>
    <div class="carousel__controls">
      <div class="carousel__dots">${dots}</div>
      <button type="button" class="carousel__toggle" data-toggle aria-label="Pausar carrossel">
        <span class="carousel__icon-pause">${icon('pause', { size: 14, stroke: 2.4 })}</span>
        <span class="carousel__icon-play">${icon('play', { size: 14, stroke: 2 })}</span>
      </button>
    </div>
  </section>`;
}
