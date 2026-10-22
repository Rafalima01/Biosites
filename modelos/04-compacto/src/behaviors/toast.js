// Aviso curto e acessível (região aria-live).
export function initToast(el) {
  let timer;
  return {
    show(message, duration = 3600) {
      if (!el) return;
      clearTimeout(timer);
      el.textContent = message;
      el.classList.add('is-visible');
      timer = setTimeout(() => el.classList.remove('is-visible'), duration);
    },
  };
}
