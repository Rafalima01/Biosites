import { esc, attrs } from '../lib/html.js';
import { T, attrI18n } from '../lib/i18n.js';
import { whatsappAttrs } from '../lib/actions.js';
import { icon } from './icons.js';

const Head = (id, { eyebrow, title, text }) => `
    <button type="button" class="modal__close" data-close ${attrs(attrI18n('aria-label', { pt: 'Fechar', en: 'Close' }))}>${icon('close', { size: 20, stroke: 2 })}</button>
    <p class="modal__eyebrow">// ${T(eyebrow)}</p>
    <h2 class="modal__title" id="${id}-title">${T(title)}</h2>
    <p class="modal__text">${T(text)}</p>`;

/** "Qual serviço você precisa?" — cada opção abre o WhatsApp com a mensagem do serviço. */
export function QuoteDialog(site) {
  const { quote } = site;
  const options = quote.options
    .map(
      (opt) => `<li><a ${attrs({ class: 'option', ...whatsappAttrs(site, opt.message), 'data-close-after': '' })}>
        <span class="option__icon" aria-hidden="true">${icon(opt.icon, { size: 20, stroke: 1.8 })}</span>
        <span class="option__label">${T(opt.label)}</span>
        <span class="option__arrow" aria-hidden="true">${icon('arrowUpRight', { size: 18, stroke: 2 })}</span>
      </a></li>`,
    )
    .join('');
  return `<dialog class="modal" id="dialog-orcamento" aria-labelledby="dialog-orcamento-title">
    <div class="modal__panel">
      ${Head('dialog-orcamento', quote)}
      <ul class="options">${options}</ul>
    </div>
  </dialog>`;
}

/** "Sistema sob medida" — formulário cujo resumo segue para o WhatsApp (ver behaviors/dialogs.js). */
export function SystemDialog(site) {
  const f = site.systemForm;
  const message = {
    intro: f.intro,
    nameLine: f.nameLine,
    summaryLine: f.summaryLine,
    error: f.error,
  };
  return `<dialog class="modal" id="dialog-sistema" aria-labelledby="dialog-sistema-title">
    <div class="modal__panel">
      ${Head('dialog-sistema', f)}
      <form class="brief" data-brief="${esc(JSON.stringify(message))}" data-whatsapp="${esc(site.contact.whatsapp.number)}" novalidate>
        <label class="field">
          <span class="field__label">${T(f.nameLabel)}</span>
          <input class="field__input" name="name" type="text" autocomplete="name" maxlength="80">
        </label>
        <label class="field">
          <span class="field__label">${T(f.summaryLabel)}</span>
          <textarea class="field__input field__input--area" name="summary" rows="5" maxlength="1200" required ${attrs(attrI18n('placeholder', f.summaryPlaceholder))}></textarea>
        </label>
        <p class="field__error" data-error role="alert" hidden></p>
        <button type="submit" class="submit">${icon('send', { size: 18, stroke: 2 })}${T(f.submit)}</button>
      </form>
    </div>
  </dialog>`;
}
