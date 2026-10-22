// Verificação do bio site da agência: config bilíngue, imagens, renderização e links.
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

// 2. Arquivos locais existem
const local = [site.brand.mark.src, ...site.portfolio.categories.flatMap((c) => c.items.map((i) => i.image))];
for (const src of local) check(existsSync(new URL(`../public${src}`, import.meta.url)), `Arquivo não encontrado: public${src}`);
for (const item of site.portfolio.categories.flatMap((c) => c.items)) check(/^https:\/\//.test(item.href), `Link do portfólio inválido: ${item.title}`);

// 3. Renderização
try {
  const page = renderPage(site);
  check((page.body.match(/<h1/g) || []).length === 1, 'A página deve ter exatamente um <h1>');
  check(!/undefined|\[object Object\]/.test(page.body), 'HTML contém "undefined" ou "[object Object]"');
  check(page.body.includes('wa.me/5586976076820'), 'Links de WhatsApp não foram gerados');
  check((page.body.match(/role="tab"/g) || []).length === site.portfolio.categories.length, 'Abas do portfólio incompletas');
} catch (err) {
  errors.push(`Falha ao renderizar: ${err.message}`);
}

const pending = ['whatsapp', 'instagram', 'email'].filter((k) => resolveChannel(site, k).pending);
if (pending.length) console.log(`ℹ Contatos ainda não configurados: ${pending.join(', ')}`);

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ ${site.id}: traduções, arquivos, renderização e links verificados.`);
