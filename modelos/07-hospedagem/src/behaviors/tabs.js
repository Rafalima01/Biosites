// Abas fixas: destaca a seção visível enquanto a página rola.
export function initTabs(nav) {
  if (!nav || !('IntersectionObserver' in window)) return;
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const setActive = (id) =>
    links.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { rootMargin: '-35% 0px -55% 0px' },
  );
  sections.forEach((s) => observer.observe(s));
  setActive(sections[0]?.id);
}
