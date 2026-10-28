import { attrs } from './html.js';

const digits = (s) => String(s || '').replace(/\D/g, '');

export function whatsappUrl(number, message) {
  const n = digits(number);
  if (!n) return '';
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

const CHANNELS = {
  whatsapp: {
    label: 'WhatsApp',
    icon: 'whatsapp',
    href: (c, opts) => whatsappUrl(c.whatsapp.number, opts.message ?? c.whatsapp.message),
  },
  instagram: {
    label: 'Instagram',
    icon: 'instagram',
    href: (c) => c.instagram.url || (c.instagram.handle ? `https://www.instagram.com/${c.instagram.handle.replace(/^@/, '')}/` : ''),
  },
  airbnb: {
    label: 'Airbnb',
    icon: 'airbnb',
    href: (c) => c.airbnb?.url,
  },
  location: {
    label: 'Localização',
    icon: 'pin',
    href: (c) =>
      c.location.mapsUrl ||
      (c.location.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.location.address)}` : ''),
  },
  website: {
    label: 'Site',
    icon: 'globe',
    href: (c) => c.website.url,
  },
};

/** Resolve um canal de contato da config em { label, icon, href, external, pending }. */
export function resolveChannel(site, key, opts = {}) {
  const channel = CHANNELS[key];
  if (!channel) throw new Error(`Canal desconhecido: "${key}"`);
  const href = channel.href(site.contact, opts) || '';
  return { key, label: channel.label, icon: channel.icon, href, external: true, pending: !href };
}

export const pendingMessage = (label) =>
  `${label}: destino ainda não configurado neste modelo demonstrativo.`;

/**
 * Renderiza o elemento interativo correto para um destino resolvido:
 * link externo (nova aba) ou botão "pendente" que apenas avisa.
 */
export function renderTarget(target, { className, label, ariaLabel, content, extra = {} }) {
  if (target.pending) {
    return `<button ${attrs({
      type: 'button',
      class: className,
      'aria-label': ariaLabel,
      'data-pending': pendingMessage(label ?? target.label),
      ...extra,
    })}>${content}</button>`;
  }
  return `<a ${attrs({
    class: className,
    href: target.href,
    'aria-label': ariaLabel,
    target: '_blank',
    rel: 'noopener noreferrer',
    ...extra,
  })}>${content}${ariaLabel ? '' : '<span class="sr-only"> (abre em nova aba)</span>'}</a>`;
}
