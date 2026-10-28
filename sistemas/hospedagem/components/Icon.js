// Ícones lineares (24×24, traço em currentColor). Adicione novos em PATHS.
const PATHS = {
  whatsapp:
    '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.2a8.5 8.5 0 1 1 15.5-4.6z"/><path d="M9.1 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .6.6 1 1.4 1.8 2.4 2.4.2.1.4.1.6 0l.6-.5c.2-.1.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.6.3-1.6.5-2.9-.1a9.5 9.5 0 0 1-4.6-4.6c-.6-1.3-.4-2.3-.1-2.9z"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>',
  globe:
    '<circle cx="12" cy="12" r="8.75"/><path d="M3.5 12h17M12 3.25c2.4 2.4 3.6 5.3 3.6 8.75S14.4 18.35 12 20.75M12 3.25C9.6 5.65 8.4 8.55 8.4 12s1.2 6.35 3.6 8.75"/>',
  airbnb:
    '<path d="M12 17.6c-1.6-2-2.7-3.7-2.7-5a2.7 2.7 0 0 1 5.4 0c0 1.3-1.1 3-2.7 5z"/><path d="M12 17.6c-2.6 3.1-6.6 3.2-7.6.1-.5-1.6.3-3.4 1.1-5.1l3.6-7.4c.7-1.3 1.6-2 2.9-2s2.2.7 2.9 2l3.6 7.4c.8 1.7 1.6 3.5 1.1 5.1-1 3.1-5 3-7.6-.1z"/>',
  pin: '<path d="M12 21s-6.5-5.9-6.5-11.3A6.5 6.5 0 0 1 18.5 9.7C18.5 15.1 12 21 12 21z"/><circle cx="12" cy="9.6" r="2.4"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.8c1.6.6 2.7 2.2 3 4.7"/>',
  bed: '<path d="M3.5 18.5V7M3.5 14h17v4.5M20.5 14v-2.5a3 3 0 0 0-3-3h-6V14"/><circle cx="7.5" cy="11" r="1.8"/>',
  bath: '<path d="M4 12h16v2.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M6.5 12V6.2a2.2 2.2 0 0 1 4.2-.9M7.5 19.5 6.5 21M16.5 19.5l1 1.5"/>',
  home: '<path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/><path d="M9.5 20.5v-5.5h5v5.5"/>',
  box: '<path d="M12 3.5 20 8v8l-8 4.5L4 16V8z"/><path d="M4 8l8 4.5L20 8M12 12.5v8M8 5.7l8 4.6"/>',
  help: '<circle cx="12" cy="12" r="8.75"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.8c0 1.7-2.4 2.1-2.4 3.6M12 16.8v.2"/>',
  tag: '<path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.6 6.6a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.4"/>',
  chat: '<path d="M20.5 12a8 8 0 0 1-11.7 7.1L4 20.5l1.4-4.6A8 8 0 1 1 20.5 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
  gift: '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5S10.8 4 8.3 4.2c-2 .2-1.8 3.3 0 4.3M12 8.5s1.2-4.5 3.7-4.3c2 .2 1.8 3.3 0 4.3"/>',
  shield: '<path d="M12 3.5 19.5 6v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="m8.8 12 2.3 2.3 4.2-4.6"/>',
  star: '<path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z" fill="currentColor" stroke="none"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  minus: '<path d="M6 12h12"/>',
  plus: '<path d="M12 6v12M6 12h12"/>',
  chevronLeft: '<path d="m14.5 6-6 6 6 6"/>',
  chevronRight: '<path d="m9.5 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  quote:
    '<path d="M10 7.5c-3 .8-5 3.2-5 6.4V17h4.6v-4.4H7.2c.2-1.6 1.3-2.8 3.1-3.3zM19 7.5c-3 .8-5 3.2-5 6.4V17h4.6v-4.4h-2.4c.2-1.6 1.3-2.8 3.1-3.3z" fill="currentColor" stroke="none"/>',
};
PATHS.edit = '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>';
PATHS.trash = '<path d="M4.5 7h15M10 11v6M14 11v6M6 7l1 12.5h10L18 7M9 7V4.5h6V7"/>';
PATHS.logout = '<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 16l-4-4 4-4M6 12h10"/>';
PATHS.chart = '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
PATHS.settings = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>';
PATHS.copy = '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h3.5"/>';
PATHS.clock = '<circle cx="12" cy="12" r="8.75"/><path d="M12 7v5l3 2"/>';
PATHS.lock = '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>';
PATHS.upload = '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15"/>';
PATHS.eye = '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>';
PATHS.percent = '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>';

export function Icon({ name, size = 24, stroke = 1.6, className = 'icon' }) {
  const body = PATHS[name];
  if (!body) throw new Error(`Ícone desconhecido: "${name}"`);
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      dangerouslySetInnerHTML={{ __html: body }} />
  );
}

export function LogoMark({ size = 36 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="16" fill="currentColor" />
      <path d="M14 38c4-4 8-4 12 0s8 4 12 0 8-4 12 0" fill="none" stroke="#f3ece0" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 47c4-4 8-4 12 0s8 4 12 0 8-4 12 0" fill="none" stroke="var(--coral)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="22" r="7" fill="#f3ece0" />
    </svg>
  );
}
