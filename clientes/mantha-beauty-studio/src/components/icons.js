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
  sparkle:
    '<path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5zM18.5 15.5c.3 1.9.9 2.5 2.8 2.8-1.9.3-2.5.9-2.8 2.8-.3-1.9-.9-2.5-2.8-2.8 1.9-.3 2.5-.9 2.8-2.8z"/>',
  list: '<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8 8.5h8M8 12h8M8 15.5h5"/>',
  // Especialidades
  brow: '<path d="M2.8 14.2c2.6-4 7.4-5.9 12-5.1 2.6.4 4.7 1.6 6.4 3.2"/><path d="M2.8 14.2c3.3-2.4 7.4-3.3 11.4-2.7 2.5.4 4.7 1.1 7 1.9"/>',
  lashes:
    '<path d="M3.2 10.2c2.4 3.2 5.3 4.8 8.8 4.8s6.4-1.6 8.8-4.8"/><path d="M5.6 13 4.2 15.1M8.6 14.5l-.8 2.4M12 15v2.6M15.4 14.5l.8 2.4M18.4 13l1.4 2.1"/>',
  lips:
    '<path d="M2.8 11.8c2.6-.3 4.4-3.5 6.5-3.5 1.1 0 1.8.7 2.7.7s1.6-.7 2.7-.7c2.1 0 3.9 3.2 6.5 3.5-2.4 1.8-5.1 4.6-9.2 4.6s-6.8-2.8-9.2-4.6z"/><path d="M2.8 11.8c3.1.7 6.1 1 9.2 1s6.1-.3 9.2-1"/>',
  chevronRight: '<path d="m10 7.5 4.5 4.5-4.5 4.5"/>',
  check: '<circle cx="12" cy="12" r="8.75"/><path d="m8.2 12.3 2.6 2.6 5-5.4"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  arrowLeft: '<path d="M15 5l-7 7 7 7"/>',
  clock: '<circle cx="12" cy="12" r="8.75"/><path d="M12 7.5V12l3 2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
};

export function icon(name, { size = 24, stroke = 1.6, className = 'icon' } = {}) {
  const body = PATHS[name];
  if (!body) throw new Error(`Ícone desconhecido: "${name}"`);
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}
