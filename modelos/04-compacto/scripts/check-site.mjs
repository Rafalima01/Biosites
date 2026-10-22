// Verificação do site ativo: estrutura da config, renderização e geração de links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveAction, resolveChannel, whatsappUrl } from '../src/lib/links.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);

const actionsOf = (s) => [
  ...s.actions.map((a) => a.action),
  ...s.sheets.map((sh) => sh.cta?.action),
].filter(Boolean);

// 1. Config
const sheetIds = new Set(site.sheets.map((s) => s.id));
check(sheetIds.size === site.sheets.length, 'IDs de painéis duplicados');
for (const action of actionsOf(site)) {
  if (action.type === 'sheet') check(sheetIds.has(action.target), `Ação aponta para painel inexistente "${action.target}"`);
  if (action.type === 'section') errors.push(`Este modelo não tem seções internas; use { type: 'sheet' } ("${action.target}")`);
}
for (const photo of [site.cover, site.portrait]) {
  check(photo.alt?.trim(), `Foto sem texto alternativo: ${photo.src}`);
  if (photo.src.startsWith('/')) check(existsSync(new URL(`../public${photo.src}`, import.meta.url)), `Foto não encontrada: public${photo.src}`);
}
const dockKeys = [...site.dock.left, site.dock.center, ...site.dock.right].filter(Boolean);

// 2. Renderização
try {
  const page = renderPage(site);
  check((page.body.match(/<h1/g) || []).length === 1, 'A página deve ter exatamente um <h1>');
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
filled.contact.youtube.url = 'https://youtube.com/@exemplo';
for (const action of actionsOf(filled)) if (action.type === 'url') action.href ||= 'https://exemplo.com.br/link';
assert.equal(whatsappUrl('+55 (11) 90000-0000', 'Olá!'), 'https://wa.me/5511900000000?text=Ol%C3%A1!');
assert.equal(resolveChannel(filled, 'instagram').href, 'https://www.instagram.com/exemplo/');
assert.match(resolveChannel(filled, 'booking').href, /^https:\/\/wa\.me\/5511900000000\?text=/);
for (const action of actionsOf(filled)) check(!resolveAction(filled, action).pending, `Ação segue pendente com dados preenchidos: ${JSON.stringify(action)}`);
check(!renderPage(filled).body.includes('data-pending'), 'Ainda há destinos pendentes com todos os dados preenchidos');

// Relatório
const pending = [
  ...[...new Set(['whatsapp', 'booking', ...dockKeys])].filter((k) => resolveChannel(site, k).pending),
  ...actionsOf(site).filter((a) => a.type === 'url' && !a.href).map((a) => a.label),
];
if (pending.length) console.log(`ℹ Destinos ainda não configurados em "${site.id}": ${pending.join(', ')}`);
if (site.demo) console.log('ℹ Modo demonstrativo ativo (aviso no rodapé). Desligue `demo` apenas com dados reais.');

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: config, renderização e links verificados.`);
