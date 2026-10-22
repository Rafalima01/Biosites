// Verificação do site ativo: estrutura da config, renderização e geração de links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveAction, resolveChannel, whatsappUrl } from '../src/lib/links.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);

const actionsOf = (s) => [
  s.hero.cta?.action,
  ...s.banners.map((b) => b.action),
  s.services.cta?.action,
  s.faq.cta?.action,
].filter(Boolean);

// 1. Config
const featureIds = site.banners.map((b) => b.id);
check(new Set(featureIds).size === featureIds.length, 'IDs de cards duplicados');
const sectionIds = new Set([site.about.id, site.services.id]);
for (const action of actionsOf(site)) {
  if (action.type === 'section') check(sectionIds.has(action.target), `Ação aponta para seção inexistente "${action.target}"`);
}
const photos = [site.hero.photo, site.about.photo, site.closing.photo].filter(Boolean);
for (const photo of photos) {
  check(photo.alt?.trim(), `Foto sem texto alternativo: ${photo.src}`);
  if (photo.src.startsWith('/')) check(existsSync(new URL(`../public${photo.src}`, import.meta.url)), `Foto não encontrada: public${photo.src}`);
}

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
for (const action of actionsOf(filled)) if (action.type === 'url') action.href ||= 'https://exemplo.com.br/link';
assert.equal(whatsappUrl('+55 (11) 90000-0000', 'Olá!'), 'https://wa.me/5511900000000?text=Ol%C3%A1!');
assert.equal(resolveChannel(filled, 'instagram').href, 'https://www.instagram.com/exemplo/');
assert.match(resolveChannel(filled, 'booking').href, /^https:\/\/wa\.me\/5511900000000\?text=/);
for (const action of actionsOf(filled)) check(!resolveAction(filled, action).pending, `Ação segue pendente com dados preenchidos: ${JSON.stringify(action)}`);
check(!renderPage(filled).body.includes('data-pending'), 'Ainda há destinos pendentes com todos os dados preenchidos');

// Relatório
const pending = [
  ...['whatsapp', 'booking', 'instagram', 'website'].filter((k) => resolveChannel(site, k).pending),
  ...actionsOf(site).filter((a) => a.type === 'url' && !a.href).map((a) => a.label),
];
if (pending.length) console.log(`ℹ Destinos ainda não configurados em "${site.id}": ${pending.join(', ')}`);
if (site.demo) console.log('ℹ Modo demonstrativo ativo (aviso no rodapé). Desligue `demo` apenas com dados reais.');

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: config, renderização e links verificados.`);
