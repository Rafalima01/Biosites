'use client';

/** Escolhe casa (e opcionalmente um pacote) na agenda e rola até ela. */
export function pickInBooking(detail) {
  window.dispatchEvent(new CustomEvent('booking:pick', { detail }));
  const target = document.getElementById('agenda');
  if (target) {
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}

export function PickButton({ houseId, packageId = null, className, children, onPicked }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onPicked?.();
        pickInBooking({ houseId, packageId });
      }}
    >
      {children}
    </button>
  );
}
