import { isOpen } from '../lib/hours.js';

// Mostra "Aberto agora" / "Fechado agora" no selo de horário e atualiza a cada minuto.
export function initHours(el) {
  if (!el) return;
  const hours = JSON.parse(el.dataset.hours);
  const state = el.querySelector('[data-state]');
  const update = () => {
    const open = isOpen(hours);
    el.dataset.open = String(open);
    state.textContent = open ? 'Aberto agora' : 'Fechado agora';
  };
  update();
  setInterval(update, 60_000);
}
