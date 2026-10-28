// Prévia de preço na agenda (no navegador). O valor oficial é sempre o do banco (quote_booking).
import { toDay, weekday } from './dates.js';

export function houseCalendar(house, { promotions = [], packages = [], busy = [] }) {
  const busySet = new Set();
  for (const b of busy) for (let d = toDay(b.starts_on); d < toDay(b.ends_on); d++) busySet.add(d);
  const pkgByDay = new Map();
  for (const p of packages.filter((p) => p.house_id === house.id)) {
    for (let d = toDay(p.starts_on); d < toDay(p.ends_on); d++) pkgByDay.set(d, p);
  }
  // Mesma prioridade do banco: promoção da casa vence a geral; entre iguais, a mais recente.
  const promos = promotions
    .filter((p) => p.house_id === house.id || !p.house_id)
    .map((p) => ({ ...p, from: toDay(p.starts_on), to: toDay(p.ends_on) }))
    .sort((a, b) => (a.house_id ? 0 : 1) - (b.house_id ? 0 : 1) || String(b.created_at).localeCompare(String(a.created_at)));

  const promoOf = (day) => promos.find((p) => day >= p.from && day <= p.to);
  const isWeekend = (day) => [5, 6].includes(weekday(day));
  const basePrice = (day) => Number(isWeekend(day) ? house.weekend_price ?? house.price : house.price);

  const priceOf = (day) => {
    const promo = promoOf(day);
    if (!promo) return basePrice(day);
    if (promo.nightly_price != null) return Number(promo.nightly_price);
    return Math.round(basePrice(day) * (1 - Number(promo.percent_off) / 100) * 100) / 100;
  };

  /** 'booked' | 'package' | 'promo' | 'high' | 'free' */
  const statusOf = (day) => {
    if (busySet.has(day)) return 'booked';
    if (pkgByDay.has(day)) return 'package';
    const promo = promoOf(day);
    if (promo && priceOf(day) < basePrice(day)) return 'promo';
    if (promo || isWeekend(day)) return 'high';
    return 'free';
  };

  function check(checkIn, checkOut) {
    const nights = checkOut - checkIn;
    if (nights < 1) return { ok: false, reason: 'Escolha uma data de saída depois da entrada.' };
    for (let d = checkIn; d < checkOut; d++) {
      if (busySet.has(d)) return { ok: false, reason: 'Esse período inclui datas já ocupadas.' };
      if (pkgByDay.has(d)) return { ok: false, reason: `Essas datas fazem parte do pacote ${pkgByDay.get(d).tag || pkgByDay.get(d).title}.` };
    }
    if (nights < house.min_nights) return { ok: false, reason: `Mínimo de ${house.min_nights} noites nesta casa.` };
    let lodging = 0;
    for (let d = checkIn; d < checkOut; d++) lodging += priceOf(d);
    const cleaning = Number(house.cleaning_fee || 0);
    return { ok: true, nights, lodging, cleaning, total: lodging + cleaning };
  }

  return { priceOf, statusOf, check, packageOf: (day) => pkgByDay.get(day), promoOf };
}
