import { attrs } from './html.js';
import { T, attrI18n } from './i18n.js';
import { whatsappUrl } from './links.js';

/** Atributos de link para o WhatsApp com mensagem em cada idioma (o href troca com o idioma). */
export function whatsappAttrs(site, message) {
  const pt = whatsappUrl(site.contact.whatsapp.number, message.pt);
  const en = whatsappUrl(site.contact.whatsapp.number, message.en);
  return { href: pt, 'data-i18n-href': JSON.stringify({ pt, en }), target: '_blank', rel: 'noopener noreferrer' };
}

/**
 * Renderiza o elemento interativo de uma ação da config:
 * janela (botão), página interna (link), URL externa (link) ou "em breve" (desativado).
 */
export function actionElement(site, action, { className, content, label }) {
  switch (action.type) {
    case 'dialog':
      return `<button ${attrs({ type: 'button', class: className, 'data-dialog': action.target, 'aria-haspopup': 'dialog' })}>${content}</button>`;
    case 'page':
      return `<a ${attrs({ class: className, href: action.href })}>${content}</a>`;
    case 'url':
      if (!action.href) {
        return `<span ${attrs({ class: `${className} is-soon`, 'aria-disabled': 'true' })}>${content}<span class="soon-tag">${T(site.soonLabel)}</span></span>`;
      }
      return `<a ${attrs({ class: className, href: action.href, target: '_blank', rel: 'noopener noreferrer', ...(label ? attrI18n('aria-label', label) : {}) })}>${content}</a>`;
    default:
      throw new Error(`Tipo de ação desconhecido: "${action.type}"`);
  }
}
