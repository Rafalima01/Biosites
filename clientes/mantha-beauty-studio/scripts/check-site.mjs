// Verificação do site ativo: estrutura da config, renderização e geração de links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { renderPage, site } from '../src/render.js';
import { resolveAction, resolveChannel, whatsappUrl } from '../src/lib/links.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);

// 1. Config
const ids = site.inspo.items.map((i) => i.id);
check(site.meta.ogImage, 'Defina meta.ogImage');
check(new Set(ids).size === ids.length, 'IDs de inspirações duplicados');
for (const item of site.inspo.items) {
  for (const tag of item.tags) check(site.inspo.tags.includes(tag), `Inspiração "${item.id}" usa categoria inexistente "${tag}"`);
}
for (const tag of site.inspo.tags) check(!site.inspo.items.length || site.inspo.items.some((i) => i.tags.includes(tag)), `Categoria "${tag}" não tem nenhuma foto`);
const photos = [site.studio.photo, site.featured.photo, site.brand.photo, site.servicesCard.photo, ...site.inspo.items.map((i) => i.photo)].filter(Boolean);
for (const photo of photos) {
  check(photo.alt?.trim(), `Foto sem texto alternativo: ${photo.src}`);
  if (photo.src.startsWith('/')) check(existsSync(new URL(`../public${photo.src}`, import.meta.url)), `Foto não encontrada: public${photo.src}`);
}

// 2. Renderização (início e /servicos/)
const pages = {};
for (const nome of ['home', 'servicos']) {
  try {
    pages[nome] = renderPage(site, nome);
    check((pages[nome].body.match(/<h1/g) || []).length === 1, `Página "${nome}" deve ter exatamente um <h1>`);
    check(!/undefined|\[object Object\]|NaN|Infinity/.test(pages[nome].body), `Página "${nome}" contém "undefined", "NaN" ou "[object Object]"`);
    check(pages[nome].head.includes('og:image'), `Página "${nome}" sem imagem de compartilhamento`);
  } catch (err) {
    errors.push(`Falha ao renderizar "${nome}": ${err.message}`);
  }
}
const { home, servicos } = pages;
if (home && servicos) {
  check(home.body.includes('data-book'), 'Botão de agendamento ausente');
  check(home.body.includes('href="/servicos/"'), 'Card de serviços não aponta para /servicos/');
  check(existsSync(new URL('../servicos/index.html', import.meta.url)), 'Página não encontrada: servicos/index.html');
  // Inspirações escolhidas: nada pré-selecionado, a faixa começa escondida.
  if (site.inspo.items.length) check(/<div class="picked" data-picked hidden>/.test(home.body), 'Faixa de inspirações escolhidas deve começar escondida');
  const total = site.services.reduce((n, g) => n + g.items.length, 0);
  check((servicos.body.match(/class="svc__book"/g) || []).length === total, 'Cada serviço precisa do seu botão Agendar');
  check(servicos.head.includes('/servicos/'), 'URL canônica da página de serviços ausente');
}
for (const g of site.services) for (const s of g.items) check(s.minutes > 0 && s.price > 0, `Serviço sem duração ou valor: ${s.name}`);

// 3. Links: com os dados preenchidos, nenhum destino pode ficar pendente
const filled = structuredClone(site);
filled.contact.whatsapp.number = '+55 (11) 90000-0000';
filled.contact.instagram.handle = '@exemplo';
filled.contact.website.url = 'https://exemplo.com.br';
filled.contact.location.address = 'Rua Exemplo, 123';
for (const l of filled.contactCard.links) if (l.action.type === 'url') l.action.href ||= 'https://exemplo.com.br/link';
assert.equal(whatsappUrl('+55 (11) 90000-0000', 'Olá!'), 'https://wa.me/5511900000000?text=Ol%C3%A1!');
assert.equal(resolveChannel(filled, 'instagram').href, 'https://www.instagram.com/exemplo/');
for (const l of filled.contactCard.links) check(!resolveAction(filled, l.action).pending, `Link segue pendente com dados preenchidos: ${l.id}`);
for (const nome of ['home', 'servicos']) check(!renderPage(filled, nome).body.includes('data-pending'), `Ainda há destinos pendentes em "${nome}" com todos os dados preenchidos`);

// Relatório
const pending = [
  ...['whatsapp', 'instagram', 'location'].filter((k) => resolveChannel(site, k).pending),
  ...site.contactCard.links.filter((l) => l.action.type === 'url' && !l.action.href).map((l) => l.label),
];
if (pending.length) console.log(`ℹ Destinos ainda não configurados em "${site.id}": ${pending.join(', ')}`);
if (site.demo) console.log('ℹ Modo demonstrativo ativo (aviso no rodapé). Desligue `demo` apenas com dados reais.');

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: config, renderização e links verificados.`);
