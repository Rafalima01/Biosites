// Verificação do site ativo: estrutura da config, renderização e geração de links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveAction, resolveChannel, whatsappUrl } from '../src/lib/links.js';
import { propertyMessage } from '../src/components/Imoveis.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);

// 1. Config
check(site.meta.ogImage, 'Defina meta.ogImage');
check(site.brand.name && site.brand.creci, 'Nome e CRECI são obrigatórios na divulgação do corretor');
for (const foto of [site.intro.photo, site.about.photo]) check(foto.alt?.trim(), `Foto sem texto alternativo: ${foto.src}`);
const sectionIds = new Set([site.about.id, site.local.id]);
const blocos = { intro: site.intro, cta: site.cta, ...site.cards };
for (const [nome, bloco] of Object.entries(blocos)) {
  const a = bloco.action;
  if (a.type === 'section') check(sectionIds.has(a.target), `"${nome}" aponta para seção inexistente "${a.target}"`);
  if (a.type === 'page') check(existsSync(new URL(`..${a.href}index.html`, import.meta.url)), `Página não encontrada: ${a.href}index.html`);
}
for (const nome of ['consultoria', 'catalogo', 'contato', 'visitas']) check(site.cards[nome]?.title?.length, `Card "${nome}" sem título`);
// Imagens locais usadas na página (recortes e ícones 3D)
const home = renderPage(site, 'home').body;
for (const [, arq] of home.matchAll(/src="\/media\/([a-z0-9-]+\.(?:png|webp))"/g)) check(existsSync(new URL(`../public/media/${arq}`, import.meta.url)), `Imagem não encontrada: public/media/${arq}`);
const codigos = new Set();
for (const p of site.properties) {
  check(p.code && !codigos.has(p.code), `Imóvel sem código ou com código repetido: ${p.title}`);
  codigos.add(p.code);
  check(p.photo?.alt?.trim() && p.price && p.place, `Imóvel incompleto (foto com alt, valor e local): ${p.code}`);
}
check(site.pages.imoveis.message.includes('{imovel}'), 'pages.imoveis.message precisa de {imovel}');

// 2. Renderização (início e /imoveis/)
for (const nome of ['home', 'imoveis']) {
  check(nome === 'home' || existsSync(new URL(`../${nome}/index.html`, import.meta.url)), `Página não encontrada: ${nome}/index.html`);
  try {
    const page = renderPage(site, nome);
    check((page.body.match(/<h1/g) || []).length === 1, `Página "${nome}" deve ter exatamente um <h1>`);
    check(!/undefined|\[object Object\]|NaN/.test(page.body), `Página "${nome}" contém "undefined", "NaN" ou "[object Object]"`);
    check(page.head.includes('og:image'), `Página "${nome}" sem imagem de compartilhamento`);
    check(page.body.includes(site.brand.creci), `Página "${nome}" sem o CRECI`);
    if (nome === 'imoveis') check((page.body.match(/class="imovel"/g) || []).length === site.properties.length, 'Cada imóvel precisa do seu card');
  } catch (err) {
    errors.push(`Falha ao renderizar "${nome}": ${err.message}`);
  }
}

// 3. Mensagem do WhatsApp por imóvel
assert.match(propertyMessage(site, { code: 'X-1', title: 'Casa teste' }), /X-1 · Casa teste/);
const imoveis = renderPage(site, 'imoveis').body;
if (!resolveChannel(site, 'whatsapp').pending) {
  for (const p of site.properties) check(imoveis.includes(encodeURIComponent(p.code)), `Imóvel sem link do WhatsApp com o código: ${p.code}`);
}

// 4. Links: com os dados preenchidos, nenhum destino pode ficar pendente
const filled = structuredClone(site);
filled.contact.whatsapp.number = '+55 (11) 90000-0000';
filled.contact.instagram.handle = '@exemplo';
filled.contact.website.url = 'https://exemplo.com.br';
filled.contact.location.address = 'Rua Exemplo, 123';
assert.equal(whatsappUrl('+55 (11) 90000-0000', 'Olá!'), 'https://wa.me/5511900000000?text=Ol%C3%A1!');
assert.equal(resolveChannel(filled, 'instagram').href, 'https://www.instagram.com/exemplo/');
assert.equal(resolveAction(filled, { type: 'page', href: '/imoveis/' }).href, '/imoveis/');
for (const nome of ['home', 'imoveis']) check(!renderPage(filled, nome).body.includes('data-pending'), `Ainda há destinos pendentes em "${nome}" com todos os dados preenchidos`);

// Relatório
const pending = ['whatsapp', 'instagram', 'location'].filter((k) => resolveChannel(site, k).pending);
if (pending.length) console.log(`ℹ Destinos ainda não configurados em "${site.id}": ${pending.join(', ')}`);
if (site.demo) console.log('ℹ Modo demonstrativo ativo (aviso no rodapé). Desligue `demo` apenas com dados reais.');

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: config, renderização e links verificados.`);
