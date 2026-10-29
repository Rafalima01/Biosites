// Comportamentos do navegador. O conteúdo já vem pré-renderizado no HTML.
import { initReveal } from './behaviors/reveal.js';
import { initToast } from './behaviors/toast.js';
import { initInspo } from './behaviors/inspo.js';

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const toast = initToast(document.querySelector('.toast'));

// Destinos ainda não configurados: avisam em vez de abrir um link inventado.
document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-pending]');
  if (el) toast.show(el.dataset.pending);
});

// Compartilhar: menu nativo do celular ou cópia do link.
document.querySelector('[data-share]')?.addEventListener('click', async () => {
  const data = { title: document.title, url: location.href };
  try {
    if (navigator.share) return await navigator.share(data);
    await navigator.clipboard.writeText(location.href);
    toast.show('Link copiado!');
  } catch {
    // Compartilhamento cancelado.
  }
});

initInspo(document.querySelector('.card--inspo'), { siteId: document.querySelector('[data-site]')?.dataset.site || 'site', toast });
initReveal();

if (import.meta.env.DEV) {
  const pending = [...new Set([...document.querySelectorAll('[data-pending]')].map((el) => el.dataset.pending))];
  if (pending.length) console.info(`[biosite] Destinos pendentes de configuração:\n- ${pending.join('\n- ')}`);
}
