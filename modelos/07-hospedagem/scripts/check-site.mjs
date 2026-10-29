// Verificação do site ativo: estrutura da config, agenda, preços, renderização e links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveChannel, whatsappUrl } from '../src/lib/links.js';
import { houseCalendar } from '../src/lib/pricing.js';
import { toDay } from '../src/lib/dates.js';
import { bookingMessage } from '../src/lib/messages.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

// 1. Config
const ids = site.houses.map((h) => h.id);
check(new Set(ids).size === ids.length, 'IDs de casas duplicados');
for (const h of site.houses) {
  check(h.price > 0 && h.guests > 0, `Casa "${h.id}" sem preço ou capacidade`);
  check(h.photos?.length > 0, `Casa "${h.id}" sem fotos`);
  for (const [from, to] of h.bookings || []) {
    check(ISO.test(from) && ISO.test(to) && toDay(to) > toDay(from), `Reserva inválida em "${h.id}": ${from} → ${to}`);
  }
}
for (const p of site.packages || []) {
  check(ids.includes(p.house), `Pacote "${p.id}" aponta para casa inexistente "${p.house}"`);
  check(ISO.test(p.from) && ISO.test(p.to) && toDay(p.to) > toDay(p.from), `Datas inválidas no pacote "${p.id}"`);
}
for (const s of site.seasons || []) {
  check(ISO.test(s.from) && ISO.test(s.to), `Datas inválidas na temporada "${s.label}"`);
  for (const id of s.houses || []) check(ids.includes(id), `Temporada "${s.label}" aponta para casa inexistente "${id}"`);
}
const photos = [site.hero.photo, ...site.houses.flatMap((h) => h.photos), ...(site.packages || []).map((p) => p.photo)];
for (const photo of photos) {
  check(photo.alt?.trim(), `Foto sem texto alternativo: ${photo.src}`);
  if (photo.src.startsWith('/')) check(existsSync(new URL(`../public${photo.src}`, import.meta.url)), `Foto não encontrada: public${photo.src}`);
}

// 2. Agenda e preços (casa de teste com regras conhecidas)
const test = { id: 't', name: 'Teste', price: 100, weekendPrice: 150, cleaningFee: 50, minNights: 2, bookings: [['2030-01-14', '2030-01-16']] };
const cal = houseCalendar({ packages: [{ house: 't', tag: 'X', from: '2030-01-20', to: '2030-01-22' }], seasons: [] }, test);
const d = toDay;
assert.equal(cal.statusOf(d('2030-01-14')), 'booked');
assert.equal(cal.statusOf(d('2030-01-16')), 'free', 'O dia do check-out deve ficar livre');
assert.equal(cal.statusOf(d('2030-01-20')), 'package');
assert.equal(cal.priceOf(d('2030-01-04')), 150, 'Sexta-feira usa o preço de fim de semana');
assert.equal(cal.quote(d('2030-01-12'), d('2030-01-14')).ok, true, 'Pode sair no dia em que outra reserva entra');
assert.equal(cal.quote(d('2030-01-13'), d('2030-01-15')).ok, false, 'Não pode cruzar datas ocupadas');
assert.equal(cal.quote(d('2030-01-16'), d('2030-01-17')).ok, false, 'Respeita o mínimo de noites');
const q = cal.quote(d('2030-01-16'), d('2030-01-18'), 0.1); // qua + qui
assert.deepEqual([q.lodging, q.total, q.savings], [200, 250, 25]);
assert.match(bookingMessage(test, { checkIn: d('2030-01-16'), checkOut: d('2030-01-18'), guests: 2, quote: q }), /2 noites[\s\S]*R\$ 250/);

// 3. Renderização
const page = renderPage(site);
check((page.body.match(/<h1/g) || []).length === 1, 'A página deve ter exatamente um <h1>');
check(!/undefined|\[object Object\]|NaN/.test(page.body), 'A página contém "undefined", "NaN" ou "[object Object]"');
check(page.body.includes('id="booking-data"'), 'Dados da agenda ausentes');
for (const h of site.houses) check(page.body.includes(`id="sheet-${h.id}"`), `Janela de detalhes ausente para "${h.id}"`);

// 4. Links: com os dados preenchidos, nenhum destino pode ficar pendente
const filled = structuredClone(site);
filled.contact.whatsapp.number = '+55 (71) 90000-0000';
filled.contact.instagram.handle = '@exemplo';
filled.contact.airbnb.url = 'https://www.airbnb.com.br/users/show/1';
filled.contact.website.url = 'https://exemplo.com.br';
filled.contact.location.address = 'Rua Exemplo, 123';
assert.equal(whatsappUrl('+55 (71) 90000-0000', 'Olá!'), 'https://wa.me/5571900000000?text=Ol%C3%A1!');
assert.equal(resolveChannel(filled, 'instagram').href, 'https://www.instagram.com/exemplo/');
check(!renderPage(filled).body.includes('data-pending'), 'Ainda há destinos pendentes com todos os dados preenchidos');

// Relatório
const pending = ['whatsapp', 'instagram', 'airbnb', 'location'].filter((k) => resolveChannel(site, k).pending);
if (pending.length) console.log(`ℹ Destinos ainda não configurados em "${site.id}": ${pending.join(', ')}`);
if (site.demo) console.log('ℹ Modo demonstrativo ativo (aviso no rodapé). Desligue `demo` apenas com dados reais.');

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: config, agenda, preços, renderização e links verificados.`);
