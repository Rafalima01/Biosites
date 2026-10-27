// Rolagem suave para âncoras internas, levando o foco ao título da seção.
export function initSmoothScroll() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-scroll]');
    if (!link) return;
    const id = decodeURIComponent(link.hash.slice(1));
    const section = document.getElementById(id);
    if (!section) return;

    event.preventDefault();
    section.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);
    const heading = section.querySelector('[tabindex="-1"]') || section;
    heading.focus({ preventScroll: true });
  });
}
