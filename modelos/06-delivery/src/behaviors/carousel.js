// Carrossel por rolagem (scroll-snap): pontos sincronizados, avanço automático
// com pausa (botão, foco, passar o mouse ou tocar) e sem animação para quem prefere menos movimento.
export function initCarousel(root, { interval = 4500 } = {}) {
  if (!root) return;
  const track = root.querySelector('[data-track]');
  const slides = [...track.children];
  const dots = [...root.querySelectorAll('[data-goto]')];
  const toggle = root.querySelector('[data-toggle]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = null;
  let paused = reduce;
  let hovering = false;

  const goTo = (i, smooth = true) => {
    index = (i + slides.length) % slides.length;
    track.scrollTo({ left: slides[index].offsetLeft, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  };

  const setActive = (i) => {
    index = i;
    dots.forEach((dot, d) => (d === i ? dot.setAttribute('aria-current', 'true') : dot.removeAttribute('aria-current')));
  };

  // Atualiza o ponto ativo conforme o slide visível (inclusive ao arrastar com o dedo).
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(slides.indexOf(entry.target));
    },
    { root: track, threshold: 0.6 },
  );
  slides.forEach((slide) => observer.observe(slide));

  const schedule = () => {
    clearInterval(timer);
    if (!paused && !hovering) timer = setInterval(() => goTo(index + 1), interval);
  };

  const setPaused = (value) => {
    paused = value;
    root.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-label', paused ? 'Retomar carrossel' : 'Pausar carrossel');
    schedule();
  };

  dots.forEach((dot) => dot.addEventListener('click', () => {
    goTo(Number(dot.dataset.goto));
    schedule();
  }));
  toggle.addEventListener('click', () => setPaused(!paused));
  root.addEventListener('pointerenter', () => { hovering = true; schedule(); });
  root.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  root.addEventListener('focusin', () => { hovering = true; schedule(); });
  root.addEventListener('focusout', () => { hovering = false; schedule(); });
  track.addEventListener('touchstart', () => setPaused(true), { passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') goTo(index + 1);
    if (event.key === 'ArrowLeft') goTo(index - 1);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : schedule()));

  setPaused(paused);
}
