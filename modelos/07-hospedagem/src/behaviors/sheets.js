// Janelas de detalhes (<dialog>): abrem como folha inferior no celular e modal no desktop.
export function initSheets() {
  const open = (id) => {
    const dialog = document.getElementById(id);
    if (!dialog?.showModal) return;
    dialog.showModal();
    dialog.querySelector('.sheet__gallery')?.scrollTo({ left: 0 });
    document.documentElement.classList.add('has-sheet');
  };
  const close = (dialog) => dialog?.open && dialog.close();

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-open]');
    if (opener) open(`sheet-${opener.dataset.open}`);
    if (event.target.closest('[data-close]')) close(event.target.closest('dialog'));
    // Clique no fundo escurecido fecha.
    if (event.target instanceof HTMLDialogElement) close(event.target);
  });

  document.querySelectorAll('dialog.sheet').forEach((d) =>
    d.addEventListener('close', () => document.documentElement.classList.remove('has-sheet')),
  );

  return { open, closeAll: () => document.querySelectorAll('dialog[open]').forEach(close) };
}
