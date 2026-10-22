// Ícones lineares (24×24, traço herdado de `currentColor`). Adicione novos ícones aqui.
const PATHS = {
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  document:
    '<path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8z"/><path d="M14 3v5h5M9 12.5h6M9 16.5h6M9 8.5h2"/>',
  gallery:
    '<path d="M4 8.5v10A2.5 2.5 0 0 0 6.5 21h10"/><rect x="7.5" y="3" width="13.5" height="14" rx="2.5"/><circle cx="14.25" cy="8.4" r="1.45"/><circle cx="14.25" cy="12.6" r="1.45"/><circle cx="12.15" cy="10.5" r="1.45"/><circle cx="16.35" cy="10.5" r="1.45"/><path d="M10.5 15h7.5"/>',
  pin: '<path d="M12 21s-6.5-5.9-6.5-11.3A6.5 6.5 0 0 1 18.5 9.7C18.5 15.1 12 21 12 21z"/><circle cx="12" cy="9.6" r="2.4"/>',
  whatsapp:
    '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.2a8.5 8.5 0 1 1 15.5-4.6z"/><path d="M9.1 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .6.6 1 1.4 1.8 2.4 2.4.2.1.4.1.6 0l.6-.5c.2-.1.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.6.3-1.6.5-2.9-.1a9.5 9.5 0 0 1-4.6-4.6c-.6-1.3-.4-2.3-.1-2.9z"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>',
  globe:
    '<circle cx="12" cy="12" r="8.75"/><path d="M3.5 12h17M12 3.25c2.4 2.4 3.6 5.3 3.6 8.75S14.4 18.35 12 20.75M12 3.25C9.6 5.65 8.4 8.55 8.4 12s1.2 6.35 3.6 8.75"/>',
  chevronRight: '<path d="M9.5 6l6 6-6 6"/>',
  chevronLeft: '<path d="M14.5 6l-6 6 6 6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  sparkle: '<path d="M12 3.5l1.6 6.9 6.9 1.6-6.9 1.6-1.6 6.9-1.6-6.9-6.9-1.6 6.9-1.6z"/>',
};

export function icon(name, { size = 24, stroke = 1.5, className = 'icon' } = {}) {
  const body = PATHS[name];
  if (!body) throw new Error(`Ícone desconhecido: "${name}"`);
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

/** Linha decorativa dourada com estrela de quatro pontas ao centro. */
export const ornamentDivider = (className = 'ornament') =>
  `<span class="${className}" aria-hidden="true"><span class="ornament__line"></span><svg viewBox="0 0 12 12" width="10" height="10"><path d="M6 0l1.1 4.9L12 6 7.1 7.1 6 12 4.9 7.1 0 6l4.9-1.1z" fill="currentColor"/></svg><span class="ornament__line"></span></span>`;
