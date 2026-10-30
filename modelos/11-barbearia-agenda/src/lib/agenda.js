// Horários livres a partir das regras do expediente e dos períodos ocupados da agenda.
// Datas no formato AAAA-MM-DD e horas em minutos, sempre no fuso do studio (`rules.offset`, em minutos).

const pad = (n) => String(n).padStart(2, '0');

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const fromMinutes = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

/** Data local do studio para um instante (ms). */
export function localDate(ms, offset) {
  const d = new Date(ms + offset * 60000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Instante (ms) de uma data + minutos do dia no fuso do studio. */
export const instant = (date, minutes, offset) => Date.parse(`${date}T00:00:00Z`) + (minutes - offset) * 60000;

/** 0 = domingo … 6 = sábado. */
export const weekday = (date) => new Date(`${date}T12:00:00Z`).getUTCDay();

export function addDays(date, n) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Horários de início em `date` para um serviço de `duration` minutos: `{ time, free }`.
 * Ocupados pela agenda vêm com `free: false` (o site mostra riscados); pausas e horários
 * que já passaram (ou sem a antecedência mínima) ficam de fora.
 * `busy`: [{ start, end }] em ms. `now`: instante atual em ms.
 */
export function daySlots(date, duration, rules, busy, now) {
  if (!rules.days.includes(weekday(date))) return [];
  const open = toMinutes(rules.open);
  const close = toMinutes(rules.close);
  const breaks = (rules.breaks || []).map((b) => [toMinutes(b.from), toMinutes(b.to)]);
  const earliest = now + rules.minNotice * 60000;
  const slots = [];
  for (let m = open; m + duration <= close; m += rules.step) {
    const end = m + duration;
    if (breaks.some(([a, b]) => m < b && end > a)) continue;
    const start = instant(date, m, rules.offset);
    const finish = instant(date, end, rules.offset);
    if (start < earliest) continue;
    slots.push({ time: fromMinutes(m), free: !busy.some((b) => start < b.end && finish > b.start) });
  }
  return slots;
}

/** Só os horários livres (ex.: ['08:00', '08:30']). */
export const slotsForDay = (...args) =>
  daySlots(...args)
    .filter((s) => s.free)
    .map((s) => s.time);

/** Sinal em reais, arredondado para centavos (ex.: 30% de 55 = 16,5). */
export const deposit = (price, rate) => Math.round(price * rate * 100) / 100;
