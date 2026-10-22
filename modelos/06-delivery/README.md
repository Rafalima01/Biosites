# Modelo 06 · Delivery

Bio site para restaurantes e delivery, focado em levar o cliente ao pedido. Demonstração com a
marca fictícia **Brasa & Massa Pizza — Delivery · Jardins**.

**Composição:** carrossel de sabores no topo (foto, nome do sabor e selo como "Tradicional" ou
"Doce"), selo circular da marca sobreposto, nome em serifa, subtítulo, descrição e selo de
horário que mostra **"Aberto agora" / "Fechado agora"** em tempo real. Em seguida, botões grandes
na cor de cada canal: app de delivery (vermelho), cardápio digital (amarelo), endereço (escuro)
e WhatsApp (verde). No desktop o carrossel fica fixo à esquerda, ocupando a altura da tela.

Fundo escuro com textura de listras, amarelo como cor de marca, Cinzel + Barlow Condensed.
Mesma base técnica dos outros modelos: página pré-renderizada a partir da config, JavaScript mínimo.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, horários, renderização e links
npm run build     # gera /dist
npm run preview   # serve o /dist localmente
```

## Estrutura

```
src/
  sites/brasa-e-massa/site.config.js   Marca, horários, sabores, botões, links e tema
  sites/index.js                       Escolhe o site ativo
  components/Carousel.js               Carrossel de sabores
  components/Intro.js                  Selo da marca, nome e selo de horário
  components/LinkCards.js              Botões de pedido por canal
  components/Footer.js                 Unidade, redes e direitos
  lib/hours.js                         Rótulo do horário e cálculo de "aberto agora"
  lib/links.js                         WhatsApp, Instagram, Maps, URLs e destinos pendentes
  behaviors/carousel.js                Pontos, avanço automático, pausa, teclado e toque
  behaviors/hours.js                   Atualiza "aberto/fechado" a cada minuto
  styles/                              Tokens e estilos por bloco
scripts/check-site.mjs                 Verificação automatizada (inclui testes de horário)
docs/referencia*.jpg                   Referências visuais do modelo
```

## Personalizar

Tudo fica em `src/sites/brasa-e-massa/site.config.js`:

| O quê | Onde |
| --- | --- |
| Nome, subtítulo, descrição, unidade | `brand` |
| Logotipo (selo gerado ou imagem do cliente) | `brand.logo` (`src` para usar uma imagem) |
| Horário de funcionamento e fuso | `hours` (`days`, `open`, `close`, `timeZone`) |
| Sabores do carrossel | `slides` (`title`, `tag`, `image`) |
| Botões de pedido | `links` (`tone`: `red`, `yellow`, `dark`, `green`) |
| WhatsApp, endereço, Instagram, site | `contact` |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `tokens.css`) |

- Nos textos dos botões, `{address}` e `{whatsapp}` são trocados pelo endereço e pelo telefone de
  `contact` automaticamente.
- Horário que fecha depois da meia-noite (ex.: `open: '18:00'`, `close: '01:00'`) é suportado.
- O carrossel avança sozinho a cada 4,5 s, pausa ao passar o mouse, focar ou tocar, tem botão de
  pausa e não se move para quem pede menos movimento no sistema.
- Links vazios viram botões que avisam "destino ainda não configurado", em vez de links
  inventados. Com `demo: true`, o rodapé avisa que marca, horários e fotos são ilustrativos.

## Publicar na Vercel

Projeto `biosite-06-delivery`, ligado ao repositório com **Root Directory** `modelos/06-delivery`.
Produção: https://biosite-06-delivery.vercel.app

## Conteúdo demonstrativo a substituir

- Marca fictícia (a referência é de uma pizzaria real; nome, endereço e telefone dela não foram usados).
- Fotos dos sabores: banco de imagens Unsplash.
- Horário, sabores e textos: ilustrativos.
- Links do app de delivery, cardápio digital, WhatsApp, endereço, Instagram e site: vazios.
