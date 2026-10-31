// Verificação do site da Vertex: conteúdo, imagens e links. Uso: npm run check
import { existsSync } from 'node:fs';
import { renderPage } from '../src/render.js';
import { agencia, modelos, clientes, segmentos } from '../src/content.js';

const errors = [];
const check = (ok, msg) => ok || errors.push(msg);
const imagem = (id) => existsSync(new URL(`../public/media/modelos/${id}.webp`, import.meta.url));

for (const m of modelos) {
  check(imagem(m.id), `Print do modelo não encontrado: public/media/modelos/${m.id}.webp`);
  check(/^https:\/\//.test(m.url), `Modelo ${m.n} sem endereço https`);
  check(segmentos.includes(m.segmento), `Modelo ${m.n} com segmento fora da lista de filtros: ${m.segmento}`);
}
for (const c of clientes) check(imagem(c.id) && /^https:\/\//.test(c.url), `Cliente incompleto (print ou endereço): ${c.nome}`);
for (const id of ['12-psicologia-longo', 'jailane-ferreira-longo']) check(imagem(id), `Print comprido da abertura não encontrado: ${id}`);
check(segmentos.every((s) => modelos.some((m) => m.segmento === s)), 'Há filtro de segmento sem nenhum modelo');
check(/^https:\/\/wa\.me\/\d+\?text=/.test(agencia.orcamento), 'Link de orçamento do WhatsApp inválido');

const { head, body } = renderPage();
check(!/undefined|\[object Object\]|NaN/.test(body), 'A página contém "undefined", "NaN" ou "[object Object]"');
// Dois <h1>: um do perfil (celular) e um da abertura (tela); só um aparece por vez
check((body.match(/<h1/g) || []).length === 2, 'A página deve ter dois <h1> (perfil no celular, abertura na tela)');
check(head.includes('og:image') && head.includes('<title>'), 'Faltam título ou imagem de compartilhamento');
check((body.match(/class="modelo"/g) || []).length === modelos.length, 'Cada modelo precisa do seu card');
for (const [, href] of body.matchAll(/href="#([a-z-]+)"/g)) check(href === 'topo' || href === 'conteudo' || body.includes(`id="${href}"`), `Âncora sem seção: #${href}`);

if (errors.length) {
  console.error(`✖ ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✔ Site da Vertex: ${modelos.length} modelos, ${clientes.length} clientes, imagens e links verificados.`);
