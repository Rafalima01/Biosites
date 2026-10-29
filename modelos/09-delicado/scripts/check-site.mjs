// Verificação do site ativo: estrutura da config, renderização e geração de links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveAction, resolveChannel, whatsappUrl } from '../src/lib/links.js';
import { slug } from '../src/lib/html.js';
import { crc16, pixPayload } from '../src/lib/pix.js';
import { slotsForDay, instant, deposit } from '../src/lib/agenda.js';
import { busyFromIcs } from '../api/disponibilidade.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);

// 1. Config
check(site.meta.ogImage, 'Defina meta.ogImage');
const menuIds = site.menu.map((m) => m.id);
check(new Set(menuIds).size === menuIds.length, 'IDs de cards do menu duplicados');
const sectionIds = new Set([site.about.id, site.gallery.id]);
for (const m of site.menu) {
  if (m.action.type === 'section') check(sectionIds.has(m.action.target), `Card "${m.id}" aponta para seção inexistente "${m.action.target}"`);
  if (m.action.type === 'page') check(existsSync(new URL(`..${m.action.href}index.html`, import.meta.url)), `Página não encontrada: ${m.action.href}index.html`);
}
const photos = [site.hero.photo, site.about.photo, ...site.gallery.items.map((g) => g.photo)];
for (const photo of photos) {
  check(photo.alt?.trim(), `Foto sem texto alternativo: ${photo.src}`);
  for (const src of [photo.src, ...(photo.srcset || '').split(',').map((s) => s.trim().split(' ')[0]).filter(Boolean)]) {
    if (src.startsWith('/')) check(existsSync(new URL(`../public${src}`, import.meta.url)), `Foto não encontrada: public${src}`);
  }
}
for (const g of site.services) for (const s of g.items) check(s.minutes > 0 && s.price > 0, `Serviço sem duração ou valor: ${s.name}`);
const serviceIds = site.services.flatMap((g) => g.items.map((s) => slug(s.name)));
check(new Set(serviceIds).size === serviceIds.length, 'Dois serviços geram o mesmo endereço de agendamento');

// Agendamento
const b = site.booking;
check(b.days.length && b.days.every((d) => d >= 0 && d <= 6), 'booking.days deve ter dias de 0 (domingo) a 6 (sábado)');
check(/^\d\d:\d\d$/.test(b.open) && /^\d\d:\d\d$/.test(b.close) && b.open < b.close, 'booking.open/close inválidos');
check(b.step > 0 && b.daysAhead > 0 && b.deposit > 0 && b.deposit < 1, 'booking.step, daysAhead ou deposit inválidos');
check(/^\+55\d{10,11}$/.test(site.pix.key) || !/^\+?\d+$/.test(site.pix.key), 'Chave Pix de celular deve estar no formato +55DDDNÚMERO');
check(site.policy.paragraphs.length && site.policy.agree, 'Política de agendamento incompleta');

// 2. Renderização (início, /servicos/ e /agendar/)
for (const nome of ['home', 'servicos', 'agendar']) {
  check(nome === 'home' || existsSync(new URL(`../${nome}/index.html`, import.meta.url)), `Página não encontrada: ${nome}/index.html`);
  try {
    const page = renderPage(site, nome);
    check((page.body.match(/<h1/g) || []).length === 1, `Página "${nome}" deve ter exatamente um <h1>`);
    check(!/undefined|\[object Object\]|NaN/.test(page.body), `Página "${nome}" contém "undefined", "NaN" ou "[object Object]"`);
    check(page.head.includes('og:image'), `Página "${nome}" sem imagem de compartilhamento`);
    if (nome === 'servicos') {
      const total = site.services.reduce((n, g) => n + g.items.length, 0);
      check((page.body.match(/class="svc__book"/g) || []).length === total, 'Cada serviço precisa do seu botão Agendar');
      for (const id of serviceIds) check(page.body.includes(`/agendar/?servico=${id}`), `Serviço sem link de agendamento: ${id}`);
    }
    if (nome === 'agendar') {
      const json = page.body.match(/<script type="application\/json" data-booking-config>([\s\S]*?)<\/script>/);
      check(json, 'Dados do agendamento ausentes na página /agendar/');
      if (json) check(JSON.parse(json[1]).services.length === serviceIds.length, 'Dados do agendamento sem todos os serviços');
      for (const step of ['servico', 'data', 'dados', 'revisao', 'sinal', 'pronto']) check(page.body.includes(`data-step="${step}"`), `Etapa ausente: ${step}`);
    }
  } catch (err) {
    errors.push(`Falha ao renderizar "${nome}": ${err.message}`);
  }
}

// 3. Agenda, horários e Pix
assert.equal(crc16('123456789'), '29B1');
const code = pixPayload({ key: site.pix.key, name: site.pix.holder, city: site.pix.city, amount: deposit(55, 0.3) });
assert.equal(code.slice(-4), crc16(code.slice(0, -4)), 'CRC do Pix');
assert.match(code, /540516\.50/, 'Valor do Pix (30% de R$ 55 = 16,50)');
const rules = { ...b, days: [6], open: '08:00', close: '12:00', step: 60, breaks: [], minNotice: 0 };
const sabado = '2026-11-07';
const ocupado = [{ start: instant(sabado, 9 * 60, b.offset), end: instant(sabado, 10 * 60, b.offset) }];
assert.deepEqual(slotsForDay(sabado, 60, rules, ocupado, 0), ['08:00', '10:00', '11:00']);
assert.deepEqual(slotsForDay('2026-11-08', 60, rules, [], 0), [], 'Domingo fechado');
const ics = [
  'BEGIN:VCALENDAR',
  'BEGIN:VEVENT', 'UID:a', 'DTSTART:20261107T120000Z', 'DTEND:20261107T130000Z', 'SUMMARY:Cliente', 'END:VEVENT',
  'BEGIN:VEVENT', 'UID:b', 'DTSTART;VALUE=DATE:20261110', 'DTEND;VALUE=DATE:20261111', 'SUMMARY:Folga', 'END:VEVENT',
  'BEGIN:VEVENT', 'UID:c', 'DTSTART:20261104T150000Z', 'DTEND:20261104T160000Z', 'RRULE:FREQ=WEEKLY;COUNT=3', 'SUMMARY:Fixo', 'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');
const busy = busyFromIcs(ics, Date.parse('2026-11-01T00:00:00Z'), Date.parse('2026-12-01T00:00:00Z'));
assert.equal(busy.length, 5, 'Agenda: 1 evento + 1 folga + 3 repetições');
assert.ok(busy.some((x) => x.start === '2026-11-10T03:00:00.000Z'), 'Folga de dia inteiro no fuso de Salvador');
check(!JSON.stringify(busy).includes('Cliente'), 'A agenda não pode expor títulos de eventos');

// 4. Links: com os dados preenchidos, nenhum destino pode ficar pendente
const filled = structuredClone(site);
filled.contact.whatsapp.number = '+55 (11) 90000-0000';
filled.contact.instagram.handle = '@exemplo';
filled.contact.website.url = 'https://exemplo.com.br';
filled.contact.location.address = 'Rua Exemplo, 123';
for (const m of filled.menu) if (m.action.type === 'url') m.action.href ||= 'https://exemplo.com.br/link';
assert.equal(whatsappUrl('+55 (11) 90000-0000', 'Olá!'), 'https://wa.me/5511900000000?text=Ol%C3%A1!');
assert.equal(resolveChannel(filled, 'instagram').href, 'https://www.instagram.com/exemplo/');
assert.equal(resolveAction(filled, { type: 'page', href: '/servicos/' }).href, '/servicos/');
for (const m of filled.menu) check(!resolveAction(filled, m.action).pending, `Card segue pendente com dados preenchidos: ${m.id}`);
for (const nome of ['home', 'servicos', 'agendar']) check(!renderPage(filled, nome).body.includes('data-pending'), `Ainda há destinos pendentes em "${nome}" com todos os dados preenchidos`);

// Relatório
const pending = [
  ...['whatsapp', 'instagram', 'location'].filter((k) => resolveChannel(site, k).pending),
  ...site.menu.filter((m) => m.action.type === 'url' && !m.action.href).map((m) => m.title),
];
if (pending.length) console.log(`ℹ Destinos ainda não configurados em "${site.id}": ${pending.join(', ')}`);
if (site.demo) console.log('ℹ Modo demonstrativo ativo (aviso no rodapé). Desligue `demo` apenas com dados reais.');

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: config, renderização e links verificados.`);
