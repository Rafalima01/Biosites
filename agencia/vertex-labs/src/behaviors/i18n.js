// Seletor PT/EN: troca textos [data-i18n], atributos [data-i18n-*] e links de WhatsApp,
// atualiza <html lang> e o título, e lembra a escolha do visitante.
const LOCALES = { pt: 'pt-BR', en: 'en' };

function apply(lang) {
  const root = document.documentElement;
  root.lang = LOCALES[lang];
  root.dataset.lang = lang;

  for (const el of document.querySelectorAll('[data-i18n]')) {
    const value = JSON.parse(el.dataset.i18n)[lang];
    if (value != null) el.textContent = value;
  }
  for (const el of document.querySelectorAll('[data-i18n-href]')) {
    el.setAttribute('href', JSON.parse(el.dataset.i18nHref)[lang]);
  }
  const title = document.querySelector('[data-i18n-title]');
  if (title) document.title = JSON.parse(title.dataset.i18nTitle)[lang];

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
