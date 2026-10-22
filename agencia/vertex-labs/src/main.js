// Comportamentos do navegador. O conteúdo já vem pré-renderizado no HTML.
import { initReveal } from './behaviors/reveal.js';
import { initSmoothScroll } from './behaviors/scroll.js';
import { initI18n } from './behaviors/i18n.js';
import { initTheme } from './behaviors/theme.js';
import { initTabs } from './behaviors/tabs.js';
import { initDialogs } from './behaviors/dialogs.js';
import { initFilters } from './behaviors/filters.js';

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

initTheme();
initI18n();
initDialogs();
initTabs(document.querySelector('[role="tablist"]'));
initFilters();
initSmoothScroll();
initReveal();
