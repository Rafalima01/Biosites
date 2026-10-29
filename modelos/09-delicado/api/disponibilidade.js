// Função da Vercel: lê a agenda do Google da profissional (endereço secreto iCal em AGENDA_ICS_URL)
// e devolve só os períodos ocupados, sem títulos nem detalhes. Nada é gravado: a agenda é a fonte.
//
// GET /api/disponibilidade?de=2026-11-01&ate=2026-12-01
// → { configured: true, busy: [{ start: ISO, end: ISO }] }
// Sem AGENDA_ICS_URL → { configured: false, busy: [] } (o site mostra todo o expediente).
import ICAL from 'ical.js';

// Fuso do studio para eventos de dia inteiro ou sem fuso (Salvador: UTC-3, sem horário de verão).
const OFFSET = process.env.AGENDA_UTC_OFFSET || '-03:00';
const DAY = 86400000;
const pad = (n) => String(n).padStart(2, '0');

function toMs(time) {
  if (time.isDate) return Date.parse(`${time.year}-${pad(time.month)}-${pad(time.day)}T00:00:00${OFFSET}`);
  if (time.zone && time.zone.tzid !== 'floating') return time.toJSDate().getTime();
  return Date.parse(`${time.year}-${pad(time.month)}-${pad(time.day)}T${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}${OFFSET}`);
}

const isFree = (component) =>
  String(component.getFirstPropertyValue('status') || '').toUpperCase() === 'CANCELLED' ||
  String(component.getFirstPropertyValue('transp') || '').toUpperCase() === 'TRANSPARENT';

/** Períodos ocupados entre `from` e `to` (ms), com eventos repetidos já expandidos. */
export function busyFromIcs(text, from, to) {
  const root = new ICAL.Component(ICAL.parse(text));
  for (const tz of root.getAllSubcomponents('vtimezone')) ICAL.TimezoneService.register(tz);

  const masters = new Map();
  const exceptions = [];
  for (const vevent of root.getAllSubcomponents('vevent')) {
    const event = new ICAL.Event(vevent);
    if (event.isRecurrenceException()) exceptions.push(event);
    else masters.set(event.uid, event);
  }
  for (const ex of exceptions) {
    const master = masters.get(ex.uid);
    if (master) master.relateException(ex);
    else masters.set(`${ex.uid}#${ex.recurrenceId}`, ex);
  }

  const busy = [];
  const add = (start, end, component) => {
    if (isFree(component)) return;
    const s = toMs(start);
    const e = end ? toMs(end) : s + (start.isDate ? DAY : 0);
    if (e > from && s < to && e > s) busy.push({ start: new Date(s).toISOString(), end: new Date(e).toISOString() });
  };

  for (const event of masters.values()) {
    if (!event.isRecurring()) {
      add(event.startDate, event.endDate, event.component);
      continue;
    }
    if (isFree(event.component)) continue;
    const it = event.iterator();
    for (let next = it.next(), guard = 0; next && guard < 5000; next = it.next(), guard++) {
      if (toMs(next) >= to) break;
      const occ = event.getOccurrenceDetails(next);
      add(occ.startDate, occ.endDate, occ.item.component);
    }
  }
  return busy.sort((a, b) => a.start.localeCompare(b.start));
}

function send(res, status, body, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache || 'no-store');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://local');
  const now = Date.now();
  const from = Date.parse(url.searchParams.get('de') || '') || now - DAY;
  const to = Math.min(Date.parse(url.searchParams.get('ate') || '') || now + 45 * DAY, from + 70 * DAY);

  const ics = process.env.AGENDA_ICS_URL;
  if (!ics) return send(res, 200, { configured: false, busy: [] }, 's-maxage=60');

  try {
    const response = await fetch(ics, { headers: { Accept: 'text/calendar' } });
    if (!response.ok) throw new Error(`agenda respondeu ${response.status}`);
    const busy = busyFromIcs(await response.text(), from, to);
    // Cache curto na Vercel: a agenda atualizada aparece em até 1 minuto.
    return send(res, 200, { configured: true, busy }, 's-maxage=60, stale-while-revalidate=120');
  } catch (err) {
    console.error('[disponibilidade]', err);
    return send(res, 502, { configured: true, busy: [], error: 'Não foi possível ler a agenda agora.' });
  }
}
