# Publicar, sistemas e ferramentas do ambiente

## Vercel (só quando o usuário pedir)

- Projeto já existe: `node scripts/publicar.mjs <projeto>` na raiz (publica a branch main do GitHub —
  faça `git push` antes). Ele espera ficar READY e mostra o link.
- **Projeto novo:** crie com a API, rodando pelo **PowerShell** (o Git Bash converte `/v10/...` em caminho
  do Windows). Escreva o JSON com a ferramenta Write (fora da raiz, ex.: scratchpad):
  `{"name":"biosite-NN-nome","framework":"vite","rootDirectory":"modelos/NN-nome","gitRepository":{"type":"github","repo":"Rafalima01/Biosites"}}`
  e rode `npx vercel api /v10/projects -X POST --input "<arquivo>"`. A proteção padrão
  (`all_except_custom_domains`) deixa o `*.vercel.app` de produção público, igual aos outros modelos.
- Depois de publicar: confira `/`, `/servicos/` e imagens com `curl` (200) e abra o site no celular;
  atualize o link nas tabelas do README da raiz e do modelo.
- Permissões já liberadas em `.claude/settings.local.json`: `npx vercel api` e `node scripts/publicar.mjs`.

## Sistema de Agendamento (`sistemas/agendamento`)

Next.js 15 + Supabase, **um banco para todos os studios** (projeto `jbudmvywhaskaemicubn`). Regras por
studio em `studios.settings` (ex.: `depositPercent` 0 = confirma direto, sem sinal). Testes do banco:
`npm run test:db` (PGlite; datas `date` precisam sair como YYYY-MM-DD). Painel:
https://sistema-agendamento-sand.vercel.app. Mudança no banco: o usuário roda o SQL no Supabase.

## Verificar no navegador

- Abra o modelo com `preview_start` (nome do `.claude/launch.json`). Para prints, force as animações:
  `document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in'))`, `loading='eager'` nas
  imagens, espere imagens e `document.fonts.ready`.
- **Print em branco** = painel em segundo plano (`document.visibilityState === 'hidden'`), não é defeito do
  site. Rolar 1 px às vezes força a pintura; senão use o Edge headless:
  `Start-Process msedge.exe -ArgumentList '--headless=new','--window-size=476,1300','--virtual-time-budget=8000','--screenshot=<png>','http://localhost:5185/' -Wait`
  (abaixo de ~500 px de largura o headless ignora a largura — para 375 use o painel).
- O servidor de desenvolvimento pode cair numa pausa longa: rode `preview_start` de novo.

## Windows

- Não há Python; scripts com Node, PowerShell ou o Python embutido do Blender.
- Imagens: System.Drawing no PowerShell (recorte, montagem lado a lado para comparar).
- Texto com barras invertidas (regex): use a ferramenta Edit, não `node -e`/heredoc.
- No Bash, `"$W\\$1"` come o `$`; para laços com caminhos do Windows prefira o PowerShell.
