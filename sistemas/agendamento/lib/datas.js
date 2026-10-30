// Datas no fuso do studio (o banco guarda tudo em UTC).

const partes = (date, tz) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );

/** Diferença (min) entre o fuso e UTC naquele instante. */
function offset(date, tz) {
  const p = partes(date, tz);
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - Math.floor(date.getTime() / 60000) * 60000) / 60000;
}

/** "2026-11-09" + "14:30" no fuso do studio → Date (instante real). */
export function noFuso(dia, hora, tz) {
  const [y, m, d] = dia.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  const palpite = Date.UTC(y, m - 1, d, hh, mm);
  return new Date(palpite - offset(new Date(palpite), tz) * 60000);
}

/** Dia de hoje (AAAA-MM-DD) no fuso do studio. */
export const hoje = (tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());

export const diaDe = (iso, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(iso));

export const hora = (iso, tz) => new Intl.DateTimeFormat('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

export const diaLongo = (dia) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${dia}T12:00:00Z`));

export const diaCurto = (iso, tz) => new Intl.DateTimeFormat('pt-BR', { timeZone: tz, weekday: 'short', day: '2-digit', month: '2-digit' }).format(new Date(iso));

/** Soma dias a "AAAA-MM-DD". */
export function somaDias(dia, n) {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const valido = (dia) => /^\d{4}-\d{2}-\d{2}$/.test(dia || '') && !Number.isNaN(new Date(`${dia}T12:00:00Z`).getTime());

export const reais = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Link de WhatsApp para falar com a cliente. */
export function whatsapp(fone, texto = '') {
  let d = String(fone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.length <= 11) d = `55${d}`;
  return `https://wa.me/${d}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
}

// ---------- Mês (calendário e dashboard) ----------

export const mesDe = (dia) => dia.slice(0, 7);

export const mesValido = (mes) => /^\d{4}-(0[1-9]|1[0-2])$/.test(mes || '');

/** Soma meses a "AAAA-MM". */
export function somaMeses(mes, n) {
  const [y, m] = mes.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
}

/** Primeira letra maiúscula ("outubro de 2026" → "Outubro de 2026"). */
export const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const nomeMes = (mes) =>
  maiuscula(new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(`${mes}-15T12:00:00Z`)));

export function diasNoMes(mes) {
  const [y, m] = mes.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** 0 = domingo … 6 = sábado (igual à coluna weekday dos horários). */
export const diaDaSemana = (dia) => new Date(`${dia}T12:00:00Z`).getUTCDay();

/** Minutos desde a meia-noite do dia, no fuso do studio ("09:30" → 570). */
export const minutos = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
};

/** Minuto de um instante dentro do `dia` (antes do dia = 0, depois = 1440). */
export function minutoNoDia(iso, dia, tz) {
  const d = diaDe(iso, tz);
  if (d < dia) return 0;
  if (d > dia) return 1440;
  return minutos(hora(iso, tz));
}
