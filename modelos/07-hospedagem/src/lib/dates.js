// Datas como número de dias desde 1970-01-01 (UTC): sem fuso nem horário de verão.
const DAY = 86400000;
const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/** 'AAAA-MM-DD' → dia */
export const toDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY;
};

export const toISO = (day) => new Date(day * DAY).toISOString().slice(0, 10);

export const weekday = (day) => new Date(day * DAY).getUTCDay();

/** Hoje no fuso do navegador (ou do servidor, no build). */
export const today = () => {
  const n = new Date();
  return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) / DAY;
};

/** 'sex, 13/11' */
export const formatShort = (day) => {
  const d = new Date(day * DAY);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${WEEKDAYS[d.getUTCDay()]}, ${dd}/${mm}`;
};

/** '29/12/2026' */
export const formatFull = (iso) => iso.split('-').reverse().join('/');

/** Dias do mês com espaços vazios no início para alinhar a semana (domingo primeiro). */
export function monthGrid(year, month) {
  const first = Date.UTC(year, month, 1) / DAY;
  const last = Date.UTC(year, month + 1, 0) / DAY;
  const cells = Array(weekday(first)).fill(null);
  for (let d = first; d <= last; d++) cells.push(d);
  return cells;
}
