// Verificação do site ativo: estrutura da config, renderização e geração de links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveAction, resolveChannel, whatsappUrl } from '../src/lib/links.js';

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

// 2. Renderização (início e /servicos/)
for (const nome of ['home', 'servicos']) {
  try {
    const page = renderPage(site, nome);
    check((page.body.match(/<h1/g) || []).length === 1, `Página "${nome}" deve ter exatamente um <h1>`);
    check(!/undefined|\[object Object\]|NaN/.test(page.body), `Página "${nome}" contém "undefined", "NaN" ou "[object Object]"`);
    check(page.head.includes('og:image'), `Página "${nome}" sem imagem de compartilhamento`);
    if (nome === 'servicos') {
      const total = site.services.reduce((n, g) => n + g.items.length, 0);
      check((page.body.match(/class="svc__book"/g) || []).length === total, 'Cada serviço precisa do seu botão Agendar');
    }
  } catch (err) {
    errors.push(`Falha ao renderizar "${nome}": ${err.message}`);
  }
}

// 3. Links: com os dados preenchidos, nenhum destino pode ficar pendente
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
for (const nome of ['home', 'servicos']) check(!renderPage(filled, nome).body.includes('data-pending'), `Ainda há destinos pendentes em "${nome}" com todos os dados preenchidos`);

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
