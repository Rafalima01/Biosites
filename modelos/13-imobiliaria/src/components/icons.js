// Ícones lineares (24×24, traço herdado de `currentColor`). Adicione novos ícones aqui.
const PATHS = {
  whatsapp:
    '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.2a8.5 8.5 0 1 1 15.5-4.6z"/><path d="M9.1 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .6.6 1 1.4 1.8 2.4 2.4.2.1.4.1.6 0l.6-.5c.2-.1.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.6.3-1.6.5-2.9-.1a9.5 9.5 0 0 1-4.6-4.6c-.6-1.3-.4-2.3-.1-2.9z"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>',
  globe:
    '<circle cx="12" cy="12" r="8.75"/><path d="M3.5 12h17M12 3.25c2.4 2.4 3.6 5.3 3.6 8.75S14.4 18.35 12 20.75M12 3.25C9.6 5.65 8.4 8.55 8.4 12s1.2 6.35 3.6 8.75"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.2h.01M12 17.2h.01" stroke-width="2.2"/>',
  pin: '<path d="M12 21s-6.5-5.9-6.5-11.3A6.5 6.5 0 0 1 18.5 9.7C18.5 15.1 12 21 12 21z"/><circle cx="12" cy="9.6" r="2.4"/>',
  scissors:
    '<circle cx="6.5" cy="7" r="2.8"/><circle cx="6.5" cy="17" r="2.8"/><path d="M8.9 8.6 20 17M8.9 15.4 20 7"/>',
  chevronsDown: '<path d="m7 6 5 5 5-5M7 13l5 5 5-5"/>',
  chevronRight: '<path d="m10 7.5 4.5 4.5-4.5 4.5"/>',
  arrowLeft: '<path d="M15 5l-7 7 7 7"/>',
  house: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
  bed: '<path d="M3 18v-7.5h18V18M3 15h18M6.5 10.5V8.2c0-.7.5-1.2 1.2-1.2h3.1c.7 0 1.2.5 1.2 1.2v2.3"/>',
  bath: '<path d="M4 12h16v2.5a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 4 14.5V12zM6.5 12V6.3A1.8 1.8 0 0 1 9.9 5.6"/><path d="M7 19l-1 2M17 19l1 2"/>',
  car: '<path d="M4.5 16.5V12l1.8-4.6c.2-.6.8-.9 1.4-.9h8.6c.6 0 1.2.3 1.4.9l1.8 4.6v4.5M4.5 12h15M4.5 16.5h15M7 19.5v-3M17 19.5v-3"/>',
  area: '<path d="M4 4h16v16H4z"/><path d="M4 9h4M4 14h2M9 4v4M14 4v2"/>',
  clock: '<circle cx="12" cy="12" r="8.75"/><path d="M12 7.5V12l3 2"/>',
  check: '<path d="m5.5 12.5 4 4 9-9"/>',
};

export function icon(name, { size = 24, stroke = 1.6, className = 'icon' } = {}) {
  const body = PATHS[name];
  if (!body) throw new Error(`Ícone desconhecido: "${name}"`);
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}
