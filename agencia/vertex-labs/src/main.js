// Comportamentos do navegador. O conteúdo já vem pré-renderizado no HTML.
import { initReveal } from './behaviors/reveal.js';
import { initSmoothScroll } from './behaviors/scroll.js';
import { initToast } from './behaviors/toast.js';
import { initI18n } from './behaviors/i18n.js';
import { initTheme } from './behaviors/theme.js';
import { initTabs } from './behaviors/tabs.js';

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const toast = initToast(document.querySelector('.toast'));

// Destinos ainda não configurados: avisam em vez de abrir um link inventado.
document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-pending]');
  if (el) toast.show(el.dataset.pending);
});

initTheme();
initI18n();
initTabs(document.querySelector('[role="tablist"]'));
initSmoothScroll();
initReveal();
