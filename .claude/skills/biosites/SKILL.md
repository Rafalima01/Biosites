---
name: biosites
description: Manual e diário de aprendizados da Vertex Labs para criar, ajustar e publicar bio sites (modelos/, clientes/, agencia/) e os elementos 3D do Blender. Use sempre que o trabalho for num bio site deste repositório — novo modelo a partir de um print de referência, ajuste visual de card, troca de imagem/elemento 3D, página de serviços, publicação na Vercel — e ao terminar, para registrar o que foi aprendido.
---

# Bio sites Vertex Labs

Este é o manual do projeto. Ele cresce a cada tarefa: **ao terminar um trabalho, registre o que aprendeu**
em [references/aprendizados.md](references/aprendizados.md) (veja "Como melhorar esta skill" no fim).

## Quem é o usuário e como ele quer o trabalho

- Responda em **português simples (PT-BR)**. O usuário fala por áudio transcrito: interprete a intenção.
- Ele cobra **fidelidade ao print de referência**: "tem que ser exatamente como tá no print". Proporções,
  posição dos elementos, cores, fonte, o que sai pela borda do card, realismo dos objetos.
- **Analise antes de entregar.** Ele já devolveu trabalho por "entregar qualquer coisa". Compare com o print
  na mesma largura, teste no celular (375 px) e no computador, e só então mostre.
- Quando faltar um recurso (imagem, modelo 3D), **procure primeiro em bancos gratuitos**; se não achar,
  indique sites onde ele possa baixar ou comprar.
- **Publicar na Vercel só quando ele pedir** ("pode publicar"). Commit e push no fim de cada tarefa são normais.
- Commits em português, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Estrutura de um modelo

Cada modelo é um projeto Vite independente (`modelos/NN-nome`), publicado como projeto próprio na Vercel.

- **Tudo vem de `src/sites/<marca>/site.config.js`**: textos, fotos, ações, tema. Componentes em
  `src/components/`, montagem das páginas em `src/render.js` (pré-renderizadas no build pelo `vite.config.js`).
- **Ações** (`src/lib/links.js`, `resolveAction`/`renderTarget`): `channel` (whatsapp, instagram, location,
  website), `page`, `section`, `url`. **Destino vazio vira botão `data-pending`** que mostra um aviso —
  nunca invente link. Na maquete o Instagram fica vazio de propósito.
- **Maquete:** WhatsApp fictício (DDD 00), endereço "Rua Exemplo", `demo: true` (nota no rodapé).
  Cliente real: copiar a pasta para `clientes/<cliente>`, trocar dados e fotos, desligar `demo`.
- **`npm run check`** (`scripts/check-site.mjs` de cada modelo) valida config, renderização e links.
  Ao mudar a estrutura, **atualize o check** (ele quebra se citar campo ou arquivo removido).
- Novo modelo: copie o mais parecido (sem `README`, `public/media` e artes antigas), `npm install`,
  troque `package.json` (`biosite-NN-nome`), registre a porta em `.claude/launch.json` (5173…5185 já usadas)
  e adicione a linha nas tabelas do `README.md` da raiz (modelos e Vercel).
- `vercel.json` de todo modelo tem `"git": {"deploymentEnabled": false}` (plano grátis: 100 publicações/dia).

Detalhes de publicação, sistemas e ferramentas do Windows: [references/publicar-e-ferramentas.md](references/publicar-e-ferramentas.md).

## Fluxo para um card ou modelo a partir de um print

1. **Leia o print com calma** e liste cada elemento: foto, textos, fonte, cores, objetos 3D, o que sai
   da borda, papel/selo/sombras. Meça posições em % da largura do card (o print é a régua).
2. **Fonte:** se a do print não for óbvia, monte uma página de teste com vários candidatos do Google Fonts
   e compare (ex.: títulos "Visite nosso Blog" → **Gluten**).
3. **Elementos visuais:** emoji 3D simples → Fluent Emoji; objeto realista → Blender (modelo livre ou feito
   do zero). Veja [references/elementos-3d.md](references/elementos-3d.md).
4. **Monte o card com medidas em `cqw`** (técnicas em [references/layout-cards.md](references/layout-cards.md)).
5. **Compare lado a lado** com o print na mesma largura do card (ex.: viewport 476 px → card de 444 px).
6. **Teste** 375 px e computador: `scrollWidth` igual à largura (sem rolagem lateral), nada de texto
   encostando na borda ou coberto por elemento, imagens carregadas.
7. `npm run check` e `npm run build`, README do modelo atualizado, commit e push.

## Economia de contexto (o limite de uso é do usuário)

O que mais gastou no Modelo 12, e como evitar:

- **Decidir antes de construir.** Pergunte de uma vez o que muda o trabalho (destinos dos botões, com ou
  sem agenda, se há print do topo). E já comece realista se o print é realista: a versão "adaptada" com
  emojis foi refeita inteira.
- **Um modelo por conversa.** Conversa longa relê tudo a cada mensagem; a skill guarda o conhecimento.
  Ao terminar um modelo, sugira continuar o próximo numa conversa nova.
- **Imagens são caras.** Teste renders em 500–600 px; junte variações lado a lado numa só imagem
  (System.Drawing) em vez de abrir uma por uma; use `zoom` numa região em vez de print da página inteira.
- **Meça com JavaScript antes de olhar.** Vazamento lateral, texto encostando, fonte carregada: confira
  `scrollWidth`, `getBoundingClientRect` e `document.fonts.check` e só tire print no fim.
- **Print em branco:** veja `document.visibilityState` antes de repetir prints (painel em segundo plano).
- **Saída enxuta:** filtre logs (`grep -E "Saved|Error"`, `Select-String`) e respostas JSON grandes
  (a da Vercel tem centenas de linhas); leia arquivos por trecho (`grep -n`, `sed -n`), não inteiros.
- **Scripts parametrizados:** ajuste por opção de linha de comando (`--flutua`, `--giro`) em vez de
  reescrever o arquivo a cada tentativa; descubra a orientação de um modelo 3D com vistas rápidas
  (workbench) antes de montar a cena.
- **Modelo e esforço:** tarefas mecânicas (copiar modelo, textos, README, publicar) cabem no Sonnet ou em
  esforço menor; o Opus vale para casar visual com print e para o Blender. Quem troca é o usuário, no
  seletor de modelo do app.

## Regras por segmento

- **Psicologia (CFP):** nome e **CRP** visíveis; **sem preços** (preço como propaganda é vedado). O check
  do Modelo 12 falha se aparecer `R$` ou `price`.
- **Barbearia/beleza:** valores podem aparecer; serviço abre o WhatsApp com nome e valor.
- Para modelos "com agenda", use o Sistema de Agendamento (veja a referência de publicação).

## Como melhorar esta skill

Ao terminar qualquer tarefa num bio site, antes do commit final:

1. Abra [references/aprendizados.md](references/aprendizados.md) e acrescente, com a data, o que foi
   **novo e não óbvio**: erro que custou tempo e como resolveu, preferência que o usuário mostrou,
   técnica que funcionou, recurso gratuito encontrado (com licença).
2. Se o aprendizado for regra geral, leve-o também para a seção certa deste arquivo ou das referências,
   e corrija o que estiver desatualizado. Não duplique: atualize.
3. Não registre o que já está no código ou no git (nomes de arquivo, histórico de commits).
