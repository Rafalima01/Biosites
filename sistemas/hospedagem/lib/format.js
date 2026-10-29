export const brl = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: Number(v) % 1 ? 2 : 0 });

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const digits = (s) => String(s || '').replace(/\D/g, '');

export function whatsappUrl(number, message) {
  const n = digits(number);
  if (!n) return '';
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export const instagramUrl = (handle) =>
  !handle ? '' : /^https?:/.test(handle) ? handle : `https://www.instagram.com/${handle.replace(/^@/, '')}/`;

/** Texto com **negrito** (único markup aceito nos textos editáveis). */
export function richParts(text = '') {
  return String(text)
    .split(/(\*\*.+?\*\*)/g)
    .filter(Boolean)
    .map((part) => (part.startsWith('**') ? { bold: true, text: part.slice(2, -2) } : { bold: false, text: part }));
}

export const slugify = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
