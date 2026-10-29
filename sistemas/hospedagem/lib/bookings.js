// Utilidades de reservas para o painel.
export const effectiveStatus = (b, now = Date.now()) =>
  b.status === 'pending' && b.expires_at && new Date(b.expires_at).getTime() <= now ? 'expired' : b.status;

export const isHolding = (b, now = Date.now()) => b.status === 'confirmed' || effectiveStatus(b, now) === 'pending';

export const guestWhatsApp = (b, message) => {
  const d = String(b.guest_phone || '').replace(/\D/g, '');
  const n = d.length <= 11 ? `55${d}` : d;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
};
