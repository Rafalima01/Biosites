// Seletor PT/EN: troca textos [data-i18n], atributos [data-i18n-<atributo>] (ex.: placeholder,
// aria-label, href), o título da página e <html lang>, e lembra a escolha do visitante.
const LOCALES = { pt: 'pt-BR', en: 'en' };
const PREFIX = 'data-i18n-';

function apply(lang) {
  const root = document.documentElement;
  root.lang = LOCALES[lang];
  root.dataset.lang = lang;

  for (const el of document.querySelectorAll('[data-i18n]')) {
    const value = JSON.parse(el.dataset.i18n)[lang];
    if (value != null) el.textContent = value;
  }

  for (const el of document.querySelectorAll('*')) {
    for (const { name, value } of [...el.attributes]) {
      if (!name.startsWith(PREFIX)) continue;
      const target = name.slice(PREFIX.length);
      const text = JSON.parse(value)[lang];
      if (target === 'title') document.title = text;
      else el.setAttribute(target, text);
    }
  }

  for (const btn of document.querySelectorAll('[data-lang]')) {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  }
}

export function initI18n() {
  const saved = document.documentElement.dataset.lang;
  if (saved && saved !== 'pt') apply(saved);

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-lang]');
    if (!btn) return;
    apply(btn.dataset.lang);
    try {
      localStorage.setItem('vx-lang', btn.dataset.lang);
    } catch {
      /* armazenamento indisponível: a escolha vale só nesta visita */
    }
  });
}
