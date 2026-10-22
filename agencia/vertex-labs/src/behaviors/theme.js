// Alternância de tema claro/escuro (o tema inicial é aplicado no <head>, antes da pintura).
export function initTheme() {
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const sync = () => meta?.setAttribute('content', root.dataset.theme === 'light' ? '#f4f3f1' : '#0a0a0b');
  sync();

  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    sync();
    try {
      localStorage.setItem('vx-theme', root.dataset.theme);
    } catch {
      /* armazenamento indisponível: a escolha vale só nesta visita */
    }
  });
}
