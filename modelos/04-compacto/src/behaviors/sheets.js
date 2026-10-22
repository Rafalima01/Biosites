// Painéis <dialog>: abrem pelos botões [data-sheet], fecham por botão, Esc ou clique fora,
// e devolvem o foco ao botão que os abriu.
export function initSheets() {
  let opener = null;

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-sheet]');
    if (!trigger) return;
    const dialog = document.getElementById(`sheet-${trigger.dataset.sheet}`);
    if (!dialog || typeof dialog.showModal !== 'function') return;
    opener = trigger;
    dialog.showModal();
    document.documentElement.classList.add('has-modal');
  });

  for (const dialog of document.querySelectorAll('dialog.sheet')) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog || event.target.closest('[data-close]')) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('has-modal');
      opener?.focus();
    });
  }
}
