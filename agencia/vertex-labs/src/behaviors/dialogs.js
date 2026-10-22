import { whatsappUrl } from '../lib/links.js';

// Janelas (<dialog>): abrem por [data-dialog], fecham por botão, Esc ou clique fora,
// e devolvem o foco ao botão que as abriu.
export function initDialogs() {
  let opener = null;

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-dialog]');
    if (!trigger) return;
    const dialog = document.getElementById(`dialog-${trigger.dataset.dialog}`);
    if (!dialog || typeof dialog.showModal !== 'function') return;
    opener = trigger;
    dialog.showModal();
    document.documentElement.classList.add('has-modal');
  });

  for (const dialog of document.querySelectorAll('dialog.modal')) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog || event.target.closest('[data-close]')) dialog.close();
      // Opção escolhida: o WhatsApp abre em nova aba e a janela fecha.
      else if (event.target.closest('[data-close-after]')) setTimeout(() => dialog.close(), 150);
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('has-modal');
      opener?.focus();
    });
  }

  initBriefForm(document.querySelector('form[data-brief]'));
}

// Formulário "Sistema sob medida": monta a mensagem no idioma atual e abre o WhatsApp.
function initBriefForm(form) {
  if (!form) return;
  const texts = JSON.parse(form.dataset.brief);
  const error = form.querySelector('[data-error]');
  const summary = form.elements.summary;

  summary.addEventListener('input', () => {
    if (!error.hidden && summary.value.trim().length >= 15) {
      error.hidden = true;
      summary.removeAttribute('aria-invalid');
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const lang = document.documentElement.dataset.lang === 'en' ? 'en' : 'pt';
    const name = form.elements.name.value.trim();
    const text = summary.value.trim();

    if (text.length < 15) {
      error.textContent = texts.error[lang];
      error.hidden = false;
      summary.setAttribute('aria-invalid', 'true');
      summary.focus();
      return;
    }

    const lines = [texts.intro[lang], ''];
    if (name) lines.push(`${texts.nameLine[lang]}: ${name}`);
    lines.push(`${texts.summaryLine[lang]}: ${text}`);
    window.open(whatsappUrl(form.dataset.whatsapp, lines.join('\n')), '_blank', 'noopener');
    form.reset();
    form.closest('dialog')?.close();
  });
}
