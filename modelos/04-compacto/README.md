# Modelo 04 · Compacto

Cartão de visita digital em uma única tela. Demonstração: **Bianca Moraes — Designer de
sobrancelhas**.

**Composição:** foto do studio no topo com monograma em contorno, retrato em moldura circular
sobre a faixa marrom (linha com pontos), logotipo com monograma + nome, quatro botões em
pílula (WhatsApp, Serviços, Sobre, Endereço), texto de apresentação, barra de redes com o
WhatsApp elevado ao centro e rodapé. Serviços e Sobre abrem em **painéis** (sobem da base no
celular, centralizados no desktop), mantendo a página curta. No desktop a foto do studio ocupa
a metade esquerda e o cartão fica à direita.

Paleta marrom, creme e bege, com Cormorant Garamond e Inter. Mesma base técnica dos outros
modelos: página pré-renderizada a partir da config, JavaScript mínimo.

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
  sites/bianca-moraes/site.config.js   Conteúdo, fotos, links, botões, painéis e tema do cliente
  sites/index.js                       Escolhe o site ativo
  components/Card.js                   Capa, retrato, logotipo, botões, texto, barra de redes, rodapé
  components/Sheets.js                 Painéis de Serviços e Sobre
  components/Monogram.js               Monograma (preenchido ou em contorno)
  lib/links.js                         WhatsApp, Instagram, YouTube, Maps, site, painéis e pendências
  behaviors/sheets.js                  Abre/fecha os painéis (Esc, clique fora, foco de volta)
  styles/tokens.css                    Cores, tipografia, sombras e movimento
  styles/components/                   Estilos do cartão e dos painéis
scripts/check-site.mjs                 Verificação automatizada
docs/referencia.webp                   Referência visual do modelo
```

## Personalizar

Tudo fica em `src/sites/bianca-moraes/site.config.js`:

| O quê | Onde |
| --- | --- |
| Nome, função, monograma e texto | `brand` |
| Foto do studio e retrato | `cover`, `portrait` |
| Botões principais (texto e ação) | `actions` |
| Conteúdo dos painéis | `sheets` (lista com `items` ou texto com `paragraphs`) |
| Barra de redes | `dock` (`left`, `center` em destaque, `right`) |
| WhatsApp, agenda, Instagram, YouTube, site, endereço | `contact` |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `tokens.css`) |

Ações disponíveis para botões e painéis:

```js
{ type: 'channel', channel: 'whatsapp' | 'booking' | 'instagram' | 'youtube' | 'location' | 'website', message?: '...' }
{ type: 'sheet', target: 'id-do-painel' }
{ type: 'url', href: 'https://...', label: 'Nome do destino' }
```

**Destinos vazios** viram botões que avisam "destino ainda não configurado", em vez de links
inventados. Com `demo: true`, o rodapé avisa que nome, textos e fotos são ilustrativos.

## Publicar na Vercel

Projeto `biosite-04-compacto`, ligado ao repositório com **Root Directory** `modelos/04-compacto`.

## Conteúdo demonstrativo a substituir

- Fotos: banco de imagens Unsplash (studio e retrato).
- Lista de serviços e texto "Sobre": redigidos para a demonstração.
- Links de WhatsApp, agenda, endereço, YouTube, Instagram e site: vazios.
