// Regras de agenda e preço de uma casa. Usadas no build (vitrine) e no navegador (reserva).
import { toDay, weekday } from './dates.js';

export const brl = (value) =>
  `R$ ${Math.round(value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

/** Prepara os dados de uma casa para consulta rápida por dia. */
export function houseCalendar(site, house) {
  const booked = new Set();
  for (const [from, to] of house.bookings || []) {
    for (let d = toDay(from); d < toDay(to); d++) booked.add(d);
  }
  const packages = new Map();
  for (const p of site.packages || []) {
    if (p.house !== house.id) continue;
    for (let d = toDay(p.from); d < toDay(p.to); d++) packages.set(d, p);
  }
  const seasons = (site.seasons || [])
    .filter((s) => !s.houses?.length || s.houses.includes(house.id))
    .map((s) => ({ ...s, from: toDay(s.from), to: toDay(s.to) }));

  const seasonOf = (day) => seasons.find((s) => day >= s.from && day <= s.to);
  const isWeekend = (day) => [5, 6].includes(weekday(day));

  /** Preço da noite que começa em `day`. */
  const priceOf = (day) => {
    const season = seasonOf(day);
    const base = isWeekend(day) ? house.weekendPrice ?? house.price : house.price;
    return season ? Math.round(base * (1 + season.markup)) : base;
  };

  /** 'booked' | 'package' | 'high' (fim de semana ou temporada) | 'free' */
  const statusOf = (day) => {
    if (booked.has(day)) return 'booked';
    if (packages.has(day)) return 'package';
    if (seasonOf(day) || isWeekend(day)) return 'high';
    return 'free';
  };

  /** Valida o período [checkIn, checkOut) e calcula o orçamento. */
  function quote(checkIn, checkOut, platformFee = 0) {
    const nights = checkOut - checkIn;
    if (nights < 1) return { ok: false, reason: 'Escolha uma data de saída depois da entrada.' };
    for (let d = checkIn; d < checkOut; d++) {
      if (booked.has(d)) return { ok: false, reason: 'Esse período inclui datas já ocupadas.' };
      if (packages.has(d)) return { ok: false, reason: `Essas datas fazem parte do pacote ${packages.get(d).tag}.` };
    }
    if (nights < (house.minNights || 1)) {
      return { ok: false, reason: `Mínimo de ${house.minNights} noites nesta casa.` };
    }
    let lodging = 0;
    for (let d = checkIn; d < checkOut; d++) lodging += priceOf(d);
    const cleaning = house.cleaningFee || 0;
    const total = lodging + cleaning;
    return { ok: true, nights, lodging, cleaning, total, savings: Math.round(total * platformFee) };
  }

  return { priceOf, statusOf, quote, packageOf: (day) => packages.get(day) };
}
