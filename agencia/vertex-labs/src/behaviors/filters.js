// Filtros do portfólio completo: mostra só os projetos da categoria escolhida.
export function initFilters() {
  const list = document.querySelector('[data-cases]');
  if (!list) return;
  const chips = [...document.querySelectorAll('[data-filter]')];
  const cases = [...list.children];
  const empty = document.querySelector('[data-empty]');

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      let visible = 0;
      for (const item of cases) {
        const show = filter === 'all' || item.dataset.category === filter;
        item.hidden = !show;
        if (show) {
          visible += 1;
          item.classList.add('is-in');
        }
      }
      empty.hidden = visible > 0;
    });
  }
}
