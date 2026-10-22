// Galeria ampliada com <dialog>: setas, teclado (← → Esc), clique fora e gesto de arrastar.
export function initLightbox(gallery, dialog) {
  if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;

  const buttons = [...gallery.querySelectorAll('[data-lightbox]')];
  const img = dialog.querySelector('.lightbox__image');
  const caption = dialog.querySelector('[data-caption]');
  const credit = dialog.querySelector('[data-credit]');
  let index = 0;
  let opener = null;

  function show(i) {
    index = (i + buttons.length) % buttons.length;
    const { full, caption: text, credit: source } = buttons[index].dataset;
    img.classList.remove('is-loaded');
    img.onload = () => img.classList.add('is-loaded');
    img.src = full;
    img.alt = text;
    caption.textContent = text;
    credit.textContent = source || '';
    // Pré-carrega a próxima imagem para a navegação ficar instantânea.
    new Image().src = buttons[(index + 1) % buttons.length].dataset.full;
  }

  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('[data-lightbox]');
    if (!button) return;
    opener = button;
    show(Number(button.dataset.lightbox));
    dialog.showModal();
    document.documentElement.classList.add('has-modal');
  });

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-modal');
    opener?.focus();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-close]') || event.target === dialog) dialog.close();
    else if (event.target.closest('[data-prev]')) show(index - 1);
    else if (event.target.closest('[data-next]')) show(index + 1);
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });

  let startX = null;
  dialog.addEventListener('pointerdown', (e) => (startX = e.clientX));
  dialog.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
}
