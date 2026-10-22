import { esc } from '../lib/html.js';
import { resolveAction, renderTarget } from '../lib/links.js';
import { icon } from './icons.js';

function SheetBody(sheet) {
  if (sheet.items) {
    return `<ul class="sheet__list">${sheet.items
      .map((item) => `<li><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></li>`)
      .join('')}</ul>`;
  }
  return (sheet.paragraphs || []).map((p) => `<p class="sheet__p">${esc(p)}</p>`).join('');
}

/** Painéis (<dialog>) abertos pelos botões com ação `{ type: 'sheet' }`. Ver behaviors/sheets.js. */
export const Sheets = (site) =>
  site.sheets
    .map(
      (sheet) => `<dialog class="sheet" id="sheet-${esc(sheet.id)}" aria-labelledby="sheet-${esc(sheet.id)}-title">
    <div class="sheet__panel">
      <span class="sheet__handle" aria-hidden="true"></span>
      <button type="button" class="sheet__close" data-close aria-label="Fechar">${icon('close', { size: 20 })}</button>
      ${sheet.eyebrow ? `<p class="sheet__eyebrow">${esc(sheet.eyebrow)}</p>` : ''}
      <h2 class="sheet__title" id="sheet-${esc(sheet.id)}-title">${esc(sheet.title)}</h2>
      ${SheetBody(sheet)}
      ${sheet.note ? `<p class="sheet__note">${esc(sheet.note)}</p>` : ''}
      ${
        sheet.cta
          ? renderTarget(resolveAction(site, sheet.cta.action), {
              className: 'sheet__cta',
              label: sheet.cta.label,
              content: esc(sheet.cta.label),
            })
          : ''
      }
    </div>
  </dialog>`,
    )
    .join('');
