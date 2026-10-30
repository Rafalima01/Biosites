// Verificação do site ativo: estrutura da config, renderização e geração de links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveAction, resolveChannel, whatsappUrl } from '../src/lib/links.js';
import { serviceMessage } from '../src/components/Servicos.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);

// 1. Config
check(site.meta.ogImage, 'Defina meta.ogImage');
const cardIds = site.cards.map((c) => c.id);
check(new Set(cardIds).size === cardIds.length, 'IDs de cards duplicados');
const sectionIds = new Set([site.about.id, site.gallery.id, site.space.id, 'cards']);
for (const c of site.cards) {
  check(c.art || c.photo, `Card "${c.id}" sem foto nem arte`);
  // Com `{dia}`, confere as 31 imagens do calendário
  const arts = !c.art ? [] : c.art.includes('{dia}') ? Array.from({ length: 31 }, (_, d) => c.art.replace('{dia}', d + 1)) : [c.art];
  for (const a of arts) check(existsSync(new URL(`../public${a}`, import.meta.url)), `Ilustração não encontrada: public${a}`);
  if (c.badge?.startsWith('/')) check(existsSync(new URL(`../public${c.badge}`, import.meta.url)), `Selo não encontrado: public${c.badge}`);
  if (c.action.type === 'section') check(sectionIds.has(c.action.target), `Card "${c.id}" aponta para seção inexistente "${c.action.target}"`);
  if (c.action.type === 'page') check(existsSync(new URL(`..${c.action.href}index.html`, import.meta.url)), `Página não encontrada: ${c.action.href}index.html`);
}
const photos = [site.hero.photo, site.space.photo, ...site.cards.filter((c) => c.photo).map((c) => c.photo), ...site.gallery.items.map((g) => g.photo)];
for (const photo of photos) {
  check(photo.alt?.trim(), `Foto sem texto alternativo: ${photo.src}`);
  for (const src of [photo.src, ...(photo.srcset || '').split(',').map((s) => s.trim().split(' ')[0]).filter(Boolean)]) {
    if (src.startsWith('/')) check(existsSync(new URL(`../public${src}`, import.meta.url)), `Foto não encontrada: public${src}`);
  }
}
for (const g of site.services) for (const s of g.items) check(s.minutes > 0 && s.price > 0, `Serviço sem duração ou valor: ${s.name}`);
check(site.pages.servicos.message.includes('{servico}'), 'pages.servicos.message precisa de {servico}');

// 2. Renderização (início e /servicos/)
for (const nome of ['home', 'servicos']) {
  check(nome === 'home' || existsSync(new URL(`../${nome}/index.html`, import.meta.url)), `Página não encontrada: ${nome}/index.html`);
  try {
    const page = renderPage(site, nome);
    check((page.body.match(/<h1/g) || []).length === 1, `Página "${nome}" deve ter exatamente um <h1>`);
    check(!/undefined|\[object Object\]|NaN/.test(page.body), `Página "${nome}" contém "undefined", "NaN" ou "[object Object]"`);
    check(page.head.includes('og:image'), `Página "${nome}" sem imagem de compartilhamento`);
    if (nome === 'servicos') {
      const total = site.services.reduce((n, g) => n + g.items.length, 0);
      check((page.body.match(/class="svc"/g) || []).length === total, 'Cada serviço precisa do seu card');
    }
  } catch (err) {
    errors.push(`Falha ao renderizar "${nome}": ${err.message}`);
  }
}

// 3. Mensagem do WhatsApp por serviço
const corte = { name: 'Corte', price: 45, minutes: 40 };
assert.match(serviceMessage(site, corte), /Corte \(R\$ 45\)/);
assert.match(serviceMessage(site, { ...corte, from: true }), /a partir de R\$ 45/);
const servicos = renderPage(site, 'servicos').body;
if (!resolveChannel(site, 'whatsapp').pending) {
  for (const g of site.services) for (const s of g.items) check(servicos.includes(encodeURIComponent(s.name)), `Serviço sem link do WhatsApp com o nome: ${s.name}`);
}

// 4. Links: com os dados preenchidos, nenhum destino pode ficar pendente
const filled = structuredClone(site);
filled.contact.whatsapp.number = '+55 (21) 90000-0000';
filled.contact.instagram.handle = '@exemplo';
filled.contact.website.url = 'https://exemplo.com.br';
filled.contact.location.address = 'Rua Exemplo, 123';
assert.equal(whatsappUrl('+55 (21) 90000-0000', 'Olá!'), 'https://wa.me/5521900000000?text=Ol%C3%A1!');
assert.equal(resolveChannel(filled, 'instagram').href, 'https://www.instagram.com/exemplo/');
assert.equal(resolveAction(filled, { type: 'page', href: '/servicos/' }).href, '/servicos/');
for (const c of filled.cards) check(!resolveAction(filled, c.action).pending, `Card segue pendente com dados preenchidos: ${c.id}`);
for (const nome of ['home', 'servicos']) check(!renderPage(filled, nome).body.includes('data-pending'), `Ainda há destinos pendentes em "${nome}" com todos os dados preenchidos`);

// Relatório
const pending = ['whatsapp', 'instagram', 'location'].filter((k) => resolveChannel(site, k).pending);
if (pending.length) console.log(`ℹ Destinos ainda não configurados em "${site.id}": ${pending.join(', ')}`);
if (site.demo) console.log('ℹ Modo demonstrativo ativo (aviso no rodapé). Desligue `demo` apenas com dados reais.');

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: config, renderização e links verificados.`);
