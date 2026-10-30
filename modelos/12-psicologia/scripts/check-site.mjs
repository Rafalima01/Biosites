// Verificação do site ativo: estrutura da config, renderização e geração de links.
// Uso: npm run check
import { existsSync, readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveAction, resolveChannel, whatsappUrl } from '../src/lib/links.js';
import { serviceMessage } from '../src/components/Servicos.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);

// 1. Config
check(site.meta.ogImage, 'Defina meta.ogImage');
check(site.brand.name && site.brand.crp, 'Nome e CRP são obrigatórios na divulgação (Código de Ética do Psicólogo)');
const fotos = [site.intro.photo, site.place.photo, site.about.photo];
for (const foto of fotos) check(foto.alt?.trim(), `Foto sem texto alternativo: ${foto.src}`);
const sectionIds = new Set([site.about.id, site.local.id]);
for (const [nome, bloco] of Object.entries({ intro: site.intro, therapies: site.therapies, content: site.content, place: site.place, cta: site.cta })) {
  const a = bloco.action;
  if (a.type === 'section') check(sectionIds.has(a.target), `"${nome}" aponta para seção inexistente "${a.target}"`);
  if (a.type === 'page') check(existsSync(new URL(`..${a.href}index.html`, import.meta.url)), `Página não encontrada: ${a.href}index.html`);
}
// Elementos 3D usados nos cards
const home = renderPage(site, 'home').body;
for (const [, nome] of home.matchAll(/src="\/media\/([a-z0-9-]+\.(?:png|webp))"/g)) check(existsSync(new URL(`../public/media/${nome}`, import.meta.url)), `Imagem 3D não encontrada: public/media/${nome}`);
for (const g of site.services) for (const s of g.items) check(s.minutes > 0, `Atendimento sem duração: ${s.name}`);
// Sem preço como propaganda: atendimentos não têm campo de valor
for (const g of site.services) for (const s of g.items) check(s.price == null, `Não divulgue valores na página (CFP): ${s.name}`);
check(site.pages.servicos.message.includes('{servico}'), 'pages.servicos.message precisa de {servico}');

// 2. Renderização (início e /servicos/)
for (const nome of ['home', 'servicos']) {
  check(nome === 'home' || existsSync(new URL(`../${nome}/index.html`, import.meta.url)), `Página não encontrada: ${nome}/index.html`);
  try {
    const page = renderPage(site, nome);
    check((page.body.match(/<h1/g) || []).length === 1, `Página "${nome}" deve ter exatamente um <h1>`);
    check(!/undefined|\[object Object\]|NaN/.test(page.body), `Página "${nome}" contém "undefined", "NaN" ou "[object Object]"`);
    check(!/R\$/.test(page.body), `Página "${nome}" mostra valores em reais (CFP)`);
    check(page.head.includes('og:image'), `Página "${nome}" sem imagem de compartilhamento`);
    check(page.body.includes(site.brand.crp), `Página "${nome}" sem o CRP`);
    if (nome === 'servicos') {
      const total = site.services.reduce((n, g) => n + g.items.length, 0);
      check((page.body.match(/class="svc"/g) || []).length === total, 'Cada atendimento precisa do seu card');
    }
  } catch (err) {
    errors.push(`Falha ao renderizar "${nome}": ${err.message}`);
  }
}

// 3. Mensagem do WhatsApp por atendimento
assert.match(serviceMessage(site, { name: 'Terapia de casal' }), /Terapia de casal/);
const servicos = renderPage(site, 'servicos').body;
if (!resolveChannel(site, 'whatsapp').pending) {
  for (const g of site.services) for (const s of g.items) check(servicos.includes(encodeURIComponent(s.name)), `Atendimento sem link do WhatsApp com o nome: ${s.name}`);
}
check(readFileSync(new URL('../public/cerebro-traco.svg', import.meta.url), 'utf8').includes('<svg'), 'Fundo do card de localização ausente');

// 4. Links: com os dados preenchidos, nenhum destino pode ficar pendente
const filled = structuredClone(site);
filled.contact.whatsapp.number = '+55 (11) 90000-0000';
filled.contact.instagram.handle = '@exemplo';
filled.contact.website.url = 'https://exemplo.com.br';
filled.contact.location.address = 'Rua Exemplo, 123';
assert.equal(whatsappUrl('+55 (11) 90000-0000', 'Olá!'), 'https://wa.me/5511900000000?text=Ol%C3%A1!');
assert.equal(resolveChannel(filled, 'instagram').href, 'https://www.instagram.com/exemplo/');
assert.equal(resolveAction(filled, { type: 'page', href: '/servicos/' }).href, '/servicos/');
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
