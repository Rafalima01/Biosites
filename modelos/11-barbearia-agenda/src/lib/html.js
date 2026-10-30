const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ENTITIES[c]);

/** Serializa atributos; `false`/`null`/`undefined` são omitidos e `true` vira atributo booleano. */
export const attrs = (obj) =>
  Object.entries(obj)
    .filter(([, v]) => v !== false && v != null)
    .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`))
    .join(' ');

/** Texto escapado com suporte a **negrito** (único markup permitido no conteúdo). */
export const rich = (value = '') => esc(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

/** Identificador para URLs: "Design simples" → "design-simples". */
export const slug = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
