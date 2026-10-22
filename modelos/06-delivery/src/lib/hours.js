// Horário de funcionamento: rótulo legível e cálculo de "aberto agora" no fuso da loja.
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** '18:00' → '18h', '23:45' → '23h45' */
export const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
};

export const hoursLabel = (hours) => `${hours.label} · ${formatTime(hours.open)} às ${formatTime(hours.close)}`;

/** Indica se a loja está aberta em `date`, considerando o fuso e horários que passam da meia-noite. */
export function isOpen(hours, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: hours.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  const day = WEEKDAYS.indexOf(get('weekday'));
  const now = Number(get('hour')) * 60 + Number(get('minute'));
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);

  if (close > open) return hours.days.includes(day) && now >= open && now < close;
  // Fecha depois da meia-noite: a madrugada pertence ao expediente do dia anterior.
  if (now >= open) return hours.days.includes(day);
  if (now < close) return hours.days.includes((day + 6) % 7);
  return false;
}
