# Modelo 05 · Premium

Página de links em formato de vitrine de produtos digitais. Demonstração: **Larissa Prado —
Estrategista digital**.

**Composição:** capa clara com linhas curvas douradas, apresentação ("Muito prazer, sou" + nome
em serifa itálica dourada + bio com destaques em negrito) e foto à direita sobre um painel
claro. A base da capa se dissolve num fundo dourado com reflexo diagonal, onde ficam os cards
de produto: vidro translúcido, imagem que "salta" para fora do card, brilho no canto, título,
descrição e botão em pílula. No celular os cards alternam a imagem entre esquerda e direita; no
desktop viram três colunas com a imagem saltando pelo topo.

Paleta creme e dourado, com Bodoni Moda e Montserrat. Mesma base técnica dos outros modelos:
página pré-renderizada a partir da config, JavaScript mínimo.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, renderização e geração de links
npm run build     # gera /dist
npm run preview   # serve o /dist localmente
```

## Estrutura

```
src/
  sites/larissa-prado/site.config.js   Conteúdo, fotos, produtos, links e tema do cliente
  sites/index.js                       Escolhe o site ativo
  components/Hero.js                   Capa com linhas douradas, apresentação e foto
  components/Products.js               Vitrine de produtos
  components/Footer.js                 Nome, redes e direitos
  lib/html.js                          Escape de HTML e `rich()` (só **negrito**)
  lib/links.js                         WhatsApp, Instagram, site, URLs e destinos pendentes
  styles/tokens.css                    Dourados, tipografia, sombras e movimento
  styles/components/                   Estilos da capa, dos produtos e do rodapé
scripts/check-site.mjs                 Verificação automatizada
docs/referencia.webp                   Referência visual do modelo
```

## Personalizar

Tudo fica em `src/sites/larissa-prado/site.config.js`:

| O quê | Onde |
| --- | --- |
| Saudação, nome, função e bio (aceita `**negrito**`) | `brand` |
| Foto da capa | `hero.photo` |
| Produtos (título, descrição, botão, imagem, lado da imagem, link) | `products` — `side: 'left' \| 'right'` |
| Redes do rodapé | `footer.links` |
| WhatsApp, Instagram, site | `contact` |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `tokens.css`) |

Cada produto aponta para `{ type: 'url', href: 'https://...', label: 'Nome' }` (página de vendas,
checkout etc.) ou para um canal (`{ type: 'channel', channel: 'whatsapp' }`). Links vazios viram
botões que avisam "destino ainda não configurado", em vez de links inventados. Com `demo: true`,
o rodapé avisa que nome, produtos, números e fotos são ilustrativos.

## Publicar na Vercel

Projeto `biosite-05-premium`, ligado ao repositório com **Root Directory** `modelos/05-premium`.
Produção: https://biosite-05-premium.vercel.app

## Conteúdo demonstrativo a substituir

- Fotos: banco de imagens Unsplash (capa e imagens dos produtos). O ideal é usar prints/mockups
  reais de cada produto.
- Nomes, descrições e "+200 templates": ilustrativos.
- Links dos produtos, WhatsApp, Instagram e site: vazios.
