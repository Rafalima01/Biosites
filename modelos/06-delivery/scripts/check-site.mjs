// Verificação do site ativo: estrutura da config, renderização, horários e geração de links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveAction, resolveChannel, whatsappUrl } from '../src/lib/links.js';
import { isOpen, hoursLabel } from '../src/lib/hours.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);

const actionsOf = (s) => s.links.map((l) => l.action).filter(Boolean);

// 1. Config
const ids = site.links.map((l) => l.id);
check(new Set(ids).size === ids.length, 'IDs de botões duplicados');
for (const action of actionsOf(site)) {
  check(action.type !== 'section', `Este modelo não tem seções internas ("${action.target}")`);
}
for (const photo of site.slides.map((s) => s.image)) {
  check(photo.alt?.trim(), `Imagem sem texto alternativo: ${photo.src}`);
  if (photo.src.startsWith('/')) check(existsSync(new URL(`../public${photo.src}`, import.meta.url)), `Imagem não encontrada: public${photo.src}`);
}
check(/^\d{2}:\d{2}$/.test(site.hours.open) && /^\d{2}:\d{2}$/.test(site.hours.close), 'Horários devem estar no formato HH:MM');

// 2. Horário de funcionamento (18:00–23:45 e um turno que passa da meia-noite)
const at = (iso) => new Date(iso);
const h = { label: 'Teste', days: [5, 6], open: '18:00', close: '23:45', timeZone: 'America/Sao_Paulo' };
assert.equal(hoursLabel(h), 'Teste · 18h às 23h45');
assert.equal(isOpen(h, at('2026-10-23T21:30:00-03:00')), true); // sexta 21h30
assert.equal(isOpen(h, at('2026-10-23T23:50:00-03:00')), false); // sexta 23h50
assert.equal(isOpen(h, at('2026-10-22T21:30:00-03:00')), false); // quinta (fora dos dias)
const late = { ...h, close: '02:00' };
assert.equal(isOpen(late, at('2026-10-24T01:30:00-03:00')), true); // madrugada de sábado = expediente de sexta
assert.equal(isOpen(late, at('2026-10-23T01:30:00-03:00')), false); // madrugada de sexta = expediente de quinta (fechado)

// 3. Renderização
try {
  const page = renderPage(site);
  check((page.body.match(/<h1/g) || []).length === 1, 'A página deve ter exatamente um <h1>');
  check(!/undefined|\[object Object\]|\{address\}|\{whatsapp\}/.test(page.body), 'HTML contém "undefined", "[object Object]" ou marcador sem substituir');
} catch (err) {
  errors.push(`Falha ao renderizar: ${err.message}`);
}

// 4. Links: com os dados preenchidos, nenhum destino pode ficar pendente
const filled = structuredClone(site);
filled.contact.whatsapp.number = '5511900000000';
filled.contact.instagram.handle = '@exemplo';
filled.contact.website.url = 'https://exemplo.com.br';
filled.contact.location.address = 'Rua Exemplo, 123';
for (const action of actionsOf(filled)) if (action.type === 'url') action.href ||= 'https://exemplo.com.br/link';
assert.equal(whatsappUrl('+55 (11) 90000-0000', 'Olá!'), 'https://wa.me/5511900000000?text=Ol%C3%A1!');
for (const action of actionsOf(filled)) check(!resolveAction(filled, action).pending, `Ação segue pendente com dados preenchidos: ${JSON.stringify(action)}`);
const filledBody = renderPage(filled).body;
check(!filledBody.includes('data-pending'), 'Ainda há destinos pendentes com todos os dados preenchidos');
check(filledBody.includes('(11) 90000-0000') && filledBody.includes('Rua Exemplo, 123'), 'Telefone/endereço de `contact` não aparecem nos botões');

// Relatório
const pending = [
  ...['whatsapp', 'location', ...site.footer.links].filter((k, i, a) => a.indexOf(k) === i && resolveChannel(site, k).pending),
  ...actionsOf(site).filter((a) => a.type === 'url' && !a.href).map((a) => a.label),
];
if (pending.length) console.log(`ℹ Destinos ainda não configurados em "${site.id}": ${pending.join(', ')}`);
if (site.demo) console.log('ℹ Modo demonstrativo ativo (aviso no rodapé). Desligue `demo` apenas com dados reais.');

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: config, horários, renderização e links verificados.`);
