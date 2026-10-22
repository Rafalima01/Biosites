import { esc } from './html.js';

/** Idioma usado no HTML pré-renderizado. */
export const BASE_LANG = 'pt';

/** Texto bilíngue → <span> com o português e a tradução em `data-i18n` (ver behaviors/i18n.js). */
export function T(value) {
  if (value == null) return '';
  if (typeof value === 'string') return esc(value);
  return `<span data-i18n="${esc(JSON.stringify(value))}">${esc(value[BASE_LANG])}</span>`;
}

/** Valor bilíngue em texto puro (para atributos), no idioma base. */
export const plain = (value) => (typeof value === 'string' ? value : value?.[BASE_LANG] ?? '');

/** Atributos para traduzir também um atributo (ex.: aria-label) ao trocar de idioma. */
export const attrI18n = (name, value) =>
  typeof value === 'string' ? { [name]: value } : { [name]: value[BASE_LANG], [`data-i18n-${name}`]: JSON.stringify(value) };
