// Datas como número de dias desde 1970-01-01 (UTC), sem fuso nem horário de verão.
const DAY = 86400000;
const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/** 'AAAA-MM-DD' → dia */
export const toDay = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY;
};
export const toISO = (day) => new Date(day * DAY).toISOString().slice(0, 10);
export const weekday = (day) => new Date(day * DAY).getUTCDay();

/** Hoje no fuso de São Paulo. */
export function today() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  return toDay(parts);
}

/** 'sex, 13/11' */
export const formatShort = (day) => {
  const d = new Date(day * DAY);
  return `${WEEKDAYS[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};
/** '29/12/2026' a partir de 'AAAA-MM-DD' ou de um dia */
export const formatDate = (v) => (typeof v === 'number' ? toISO(v) : String(v).slice(0, 10)).split('-').reverse().join('/');

/** Dias do mês com espaços no início para alinhar a semana (domingo primeiro). */
export function monthGrid(year, month) {
  const first = Date.UTC(year, month, 1) / DAY;
  const last = Date.UTC(year, month + 1, 0) / DAY;
  const cells = Array(weekday(first)).fill(null);
  for (let d = first; d <= last; d++) cells.push(d);
  return cells;
}

export const overlaps = (aIn, aOut, bIn, bOut) => aIn < bOut && bIn < aOut;
