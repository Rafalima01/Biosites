// Galeria de inspirações: filtros por categoria, curtidas e escolha de referências.
// As escolhas aparecem no cartão de agendamento e entram na mensagem do WhatsApp.
const store = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Navegação privada: segue funcionando só nesta visita.
    }
  },
};

export function initInspo(root, { siteId, toast }) {
  if (!root) return;
  const tiles = [...root.querySelectorAll('.tile[data-id]')];
  const chips = [...root.querySelectorAll('[data-filter]')];
  const empty = root.querySelector('[data-empty]');
  const likeCount = root.querySelector('[data-like-count]');
  const picked = document.querySelector('[data-picked]');
  const book = document.querySelector('[data-book]');
  const baseMessage = book?.dataset.message || '';
  const keys = { likes: `${siteId}:curtidas`, picks: `${siteId}:inspiracoes` };
  const valid = (ids) => ids.filter((id) => tiles.some((t) => t.dataset.id === id));
  let likes = new Set(valid(store.get(keys.likes)));
  let picks = valid(store.get(keys.picks));
  const active = new Set();

  const tileOf = (id) => tiles.find((t) => t.dataset.id === id);
  const titleOf = (id) => tileOf(id)?.querySelector('[data-pick]').dataset.title || id;

  function renderFilters() {
    let visible = 0;
    for (const t of tiles) {
      const tags = t.dataset.tags.split('|');
      const show = !active.size || [...active].some((a) => tags.includes(a));
      t.hidden = !show;
      if (show) visible++;
    }
    chips.forEach((c) => c.setAttribute('aria-pressed', String(active.has(c.dataset.filter))));
    if (empty) empty.hidden = visible > 0;
  }

  function renderState() {
    for (const t of tiles) {
      const id = t.dataset.id;
      t.querySelector('[data-like]').setAttribute('aria-pressed', String(likes.has(id)));
      const pick = t.querySelector('[data-pick]');
      const on = picks.includes(id);
      pick.setAttribute('aria-pressed', String(on));
      t.classList.toggle('is-picked', on);
    }
    if (likeCount) likeCount.textContent = String(likes.size);

    // Rostinhos no cartão de agendamento.
    if (picked && picks.length) {
      const faces = picks
        .slice(0, 4)
        .map((id) => {
          const img = tileOf(id).querySelector('img');
          return `<span class="faces__item"><img src="${img.currentSrc || img.src}" alt="" width="40" height="40"></span>`;
        })
        .join('');
      picked.innerHTML = `<span class="faces__list">${faces}</span><span class="faces__more">${picks.length > 4 ? `+${picks.length - 4} · ` : ''}${picks.length === 1 ? '1 escolhida' : `${picks.length} escolhidas`}</span>`;
    }

    // Mensagem do WhatsApp com as inspirações escolhidas.
    if (book) {
      const message = picks.length ? `${baseMessage}\nInspirações que escolhi no site: ${picks.map(titleOf).join(', ')}.` : baseMessage;
      if (book.tagName === 'A') {
        const url = new URL(book.href);
        url.searchParams.set('text', message);
        book.href = url.toString();
      }
    }
  }

  root.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]');
    if (chip) {
      const tag = chip.dataset.filter;
      active.has(tag) ? active.delete(tag) : active.add(tag);
      return renderFilters();
    }
    const tile = event.target.closest('.tile[data-id]');
    if (!tile) return;
    const id = tile.dataset.id;
    if (event.target.closest('[data-like]')) {
      likes.has(id) ? likes.delete(id) : likes.add(id);
      store.set(keys.likes, [...likes]);
      return renderState();
    }
    if (event.target.closest('[data-pick]')) {
      const on = picks.includes(id);
      picks = on ? picks.filter((p) => p !== id) : [...picks, id];
      store.set(keys.picks, picks);
      renderState();
      toast.show(on ? 'Inspiração removida.' : `"${titleOf(id)}" adicionada às suas inspirações.`, 2200);
    }
  });

  renderFilters();
  renderState();
}
