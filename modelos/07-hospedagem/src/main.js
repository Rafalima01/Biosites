// Comportamentos do navegador. O conteúdo já vem pré-renderizado no HTML.
import { initReveal } from './behaviors/reveal.js';
import { initToast } from './behaviors/toast.js';
import { initSheets } from './behaviors/sheets.js';
import { initTabs } from './behaviors/tabs.js';
import { initBooking } from './behaviors/booking.js';

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const toast = initToast(document.querySelector('.toast'));

// Destinos ainda não configurados: avisam em vez de abrir um link inventado.
document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-pending]');
  if (el) toast.show(el.dataset.pending);
});

// Rolagem suave para âncoras internas, descontando a barra fixa do topo.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-scroll]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  event.preventDefault();
  scrollToSection(target);
});

function scrollToSection(target) {
  const offset = document.querySelector('.topbar')?.offsetHeight ?? 0;
  const top = target.getBoundingClientRect().top + window.scrollY - offset - 8;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
}

const sheets = initSheets();
initTabs(document.querySelector('[data-tabs]'));
initBooking(document.querySelector('[data-booking]'), { toast, sheets, scrollToSection });
initReveal();

if (import.meta.env.DEV) {
  const pending = [...new Set([...document.querySelectorAll('[data-pending]')].map((el) => el.dataset.pending))];
  if (pending.length) console.info(`[biosite] Destinos pendentes de configuração:\n- ${pending.join('\n- ')}`);
}
