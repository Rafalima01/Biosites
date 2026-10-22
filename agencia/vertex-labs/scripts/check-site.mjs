// Verificação do bio site da agência: config bilíngue, imagens, páginas, janelas e links.
// Uso: npm run check
import { existsSync } from 'node:fs';
import { renderPage, site } from '../src/render.js';
import { resolveChannel } from '../src/lib/links.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);

// 1. Todo texto bilíngue precisa das duas línguas
const walk = (value, path) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (keys.includes('pt') || keys.includes('en')) {
      check(value.pt?.trim() && value.en?.trim(), `Tradução incompleta em ${path}`);
      return;
    }
    for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
  } else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
};
walk(site, 'site');

// 2. Arquivos locais e categorias do portfólio
const local = [site.brand.mark.src, ...site.portfolio.items.map((i) => i.image)];
for (const src of local) check(existsSync(new URL(`../public${src}`, import.meta.url)), `Arquivo não encontrado: public${src}`);
const categories = new Set(site.portfolio.categories.map((c) => c.id));
for (const item of site.portfolio.items) check(categories.has(item.category), `Categoria inexistente em "${item.title}": ${item.category}`);
check(existsSync(new URL('../portfolio/index.html', import.meta.url)), 'Falta portfolio/index.html');

// 3. Ações: janelas existem e páginas internas apontam para rotas conhecidas
const dialogs = new Set(['orcamento', 'sistema']);
for (const action of [site.cta.action, ...site.links.map((l) => l.action)]) {
  if (action.type === 'dialog') check(dialogs.has(action.target), `Janela inexistente: ${action.target}`);
  if (action.type === 'page') check(action.href === '/portfolio/', `Página desconhecida: ${action.href}`);
}

// 4. Renderização das duas páginas
try {
  const home = renderPage(site, 'home').body;
  const portfolio = renderPage(site, 'portfolio').body;
  for (const [name, body] of [['início', home], ['portfólio', portfolio]]) {
    check((body.match(/<h1/g) || []).length === 1, `Página ${name}: deve ter exatamente um <h1>`);
    check(!/undefined|\[object Object\]/.test(body), `Página ${name}: HTML contém "undefined" ou "[object Object]"`);
    check(body.includes('id="dialog-orcamento"'), `Página ${name}: falta a janela de orçamento`);
  }
  check((home.match(/wa\.me\/5586976076820/g) || []).length >= site.quote.options.length, 'Opções de orçamento sem link de WhatsApp');
  check(home.includes('id="dialog-sistema"') && home.includes('name="summary"'), 'Falta o formulário do sistema sob medida');
  check(!home.includes('Ver ao vivo') && !/class="work__link"/.test(home), 'O resumo do portfólio não deve ter links "ao vivo"');
  check((portfolio.match(/class="case /g) || []).length === site.portfolio.items.length, 'Portfólio completo incompleto');
} catch (err) {
  errors.push(`Falha ao renderizar: ${err.message}`);
}

const pending = ['whatsapp', 'instagram', 'email'].filter((k) => resolveChannel(site, k).pending);
if (pending.length) console.log(`ℹ Contatos ainda não configurados: ${pending.join(', ')}`);
if (site.links.some((l) => l.action.type === 'url' && !l.action.href)) console.log('ℹ "Site da Vertex" ainda sem endereço (aparece como "em breve").');

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: traduções, arquivos, páginas, janelas e links verificados.`);
