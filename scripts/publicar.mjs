// Publica UM projeto da Vercel a partir da branch main do GitHub (o que já foi enviado com git push).
//
// Os projetos não publicam sozinhos a cada push (vercel.json: git.deploymentEnabled = false), porque
// cada push gerava uma publicação em todos os projetos e esgotava o limite do plano grátis
// (100 publicações por dia). Publique só o projeto cuja pasta mudou.
//
// Uso (na raiz do repositório, com a CLI da Vercel logada):
//   node scripts/publicar.mjs biosite-jailane-ferreira
//   node scripts/publicar.mjs biosite-jailane-ferreira --branch outra-branch
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [projeto, ...resto] = process.argv.slice(2);
const branch = resto.includes('--branch') ? resto[resto.indexOf('--branch') + 1] : 'main';
if (!projeto) {
  console.error('Uso: node scripts/publicar.mjs <projeto-vercel> [--branch main]');
  process.exit(1);
}

const api = (rota, extra = []) => {
  const r = spawnSync('npx', ['vercel', 'api', rota, ...extra], { encoding: 'utf8', shell: true, env: { ...process.env, MSYS_NO_PATHCONV: '1' } });
  const texto = r.stdout || '';
  const i = texto.indexOf('{');
  if (i < 0) throw new Error(`Vercel não respondeu em ${rota}: ${r.stderr?.slice(-300)}`);
  return JSON.parse(texto.slice(i));
};

const corpo = path.join(mkdtempSync(path.join(tmpdir(), 'publicar-')), 'deploy.json');
writeFileSync(
  corpo,
  JSON.stringify({ name: projeto, project: projeto, target: 'production', gitSource: { type: 'github', org: 'Rafalima01', repo: 'Biosites', ref: branch } }),
);
const dep = api('/v13/deployments', ['-X', 'POST', '--input', `"${corpo}"`]);
if (dep.error) {
  console.error(`✖ ${projeto}: ${dep.error.message || JSON.stringify(dep.error)}`);
  process.exit(1);
}
console.log(`… ${projeto}: publicação ${dep.id} iniciada (branch ${branch})`);

for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const d = api(`/v13/deployments/${dep.id}`);
  if (d.readyState === 'READY') {
    console.log(`✔ ${projeto} no ar: https://${(d.alias || [])[0] || d.url}`);
    process.exit(0);
  }
  if (['ERROR', 'CANCELED'].includes(d.readyState)) {
    console.error(`✖ ${projeto}: ${d.readyState} (veja o log na Vercel: https://vercel.com/dashboard)`);
    process.exit(1);
  }
}
console.error(`… ${projeto}: ainda publicando; confira na Vercel.`);
