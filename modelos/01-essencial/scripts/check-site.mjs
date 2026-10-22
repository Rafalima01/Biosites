// Verificação do site ativo: estrutura da config, renderização e geração de links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveAction, resolveChannel, whatsappUrl } from '../src/lib/links.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);

// 1. Config
const cardIds = site.cards.map((c) => c.id);
check(new Set(cardIds).size === cardIds.length, 'IDs de cards duplicados');
const sectionIds = new Set(site.sections.map((s) => s.id));
for (const card of site.cards) {
  if (card.action.type === 'section') check(sectionIds.has(card.action.target), `Card "${card.id}" aponta para seção inexistente "${card.action.target}"`);
}
check(existsSync(new URL(`../public${site.brand.portrait.src}`, import.meta.url)), `Fotografia não encontrada: public${site.brand.portrait.src}`);
for (const s of site.sections.filter((s) => s.type === 'gallery')) {
  for (const item of s.items) check(item.alt?.trim(), `Imagem da galeria sem texto alternativo: ${item.thumb}`);
}

// 2. Renderização
let page;
try {
  page = renderPage(site);
  check(page.body.includes('<h1'), 'Página sem <h1>');
  check(!/undefined|\[object Object\]/.test(page.body), 'HTML contém "undefined" ou "[object Object]"');
} catch (err) {
  errors.push(`Falha ao renderizar: ${err.message}`);
}

// 3. Links: com os dados preenchidos, nenhum destino pode ficar pendente
const filled = structuredClone(site);
filled.contact.whatsapp.number = '+55 (11) 90000-0000';
filled.contact.instagram.handle = '@exemplo';
filled.contact.website.url = 'https://exemplo.com.br';
filled.contact.location.address = 'Rua Exemplo, 123';
assert.equal(whatsappUrl('+55 (11) 90000-0000', 'Olá!'), 'https://wa.me/5511900000000?text=Ol%C3%A1!');
assert.equal(resolveChannel(filled, 'instagram').href, 'https://www.instagram.com/exemplo/');
assert.match(resolveChannel(filled, 'booking').href, /^https:\/\/wa\.me\/5511900000000\?text=/);
assert.match(resolveChannel(filled, 'location').href, /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=Rua/);
for (const card of filled.cards) check(!resolveAction(filled, card.action).pending, `Card "${card.id}" segue pendente mesmo com dados preenchidos`);
check(!renderPage(filled).body.includes('data-pending'), 'Ainda há destinos pendentes com todos os dados preenchidos');

// Relatório
const pending = ['whatsapp', 'booking', 'instagram', 'location', 'website'].filter((k) => resolveChannel(site, k).pending);
if (pending.length) console.log(`ℹ Destinos ainda não configurados em "${site.id}": ${pending.join(', ')}`);

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: config, renderização e links verificados.`);
