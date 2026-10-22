// Comportamentos do navegador. O conteúdo já vem pré-renderizado no HTML.
import { initReveal } from './behaviors/reveal.js';
import { initToast } from './behaviors/toast.js';
import { initCarousel } from './behaviors/carousel.js';
import { initHours } from './behaviors/hours.js';

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const toast = initToast(document.querySelector('.toast'));

// Destinos ainda não configurados: avisam em vez de abrir um link inventado.
document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-pending]');
  if (el) toast.show(el.dataset.pending);
});

initCarousel(document.querySelector('[data-carousel]'));
initHours(document.querySelector('[data-hours]'));
initReveal();

if (import.meta.env.DEV) {
  const pending = [...new Set([...document.querySelectorAll('[data-pending]')].map((el) => el.dataset.pending))];
  if (pending.length) console.info(`[biosite] Destinos pendentes de configuração:\n- ${pending.join('\n- ')}`);
}
