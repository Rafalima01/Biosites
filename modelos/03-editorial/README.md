# Modelo 03 · Editorial

Modelo com linguagem de revista: azul-marinho, títulos em serifa (Playfair Display) e faixas de
foto. Demonstração: **Marina Albuquerque — Mentora de marketing digital**.

**Composição:** capa com o nome em serifa grande sobre a foto, quadro de números com o botão
principal, faixas editoriais (foto + título em itálico, ou textura de cetim com botão), "Quem é"
com foto em duotone azul, serviços numerados, quadro "Ficou com alguma dúvida?" e encerramento
com retrato grande e rodapé sobreposto. No desktop a capa vira duas colunas e as faixas viram
três "capas de revista" lado a lado.

Mesma base técnica dos modelos 01 e 02: página pré-renderizada a partir da config, JavaScript mínimo.

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
  sites/marina-albuquerque/site.config.js   Conteúdo, fotos, links, seções e tema do cliente
  sites/index.js                            Escolhe o site ativo
  components/                               Hero, Banners, Sections (Sobre, Serviços, Dúvidas),
                                            Closing (retrato + rodapé), Picture, icons
  lib/links.js                              WhatsApp, Instagram, Maps, site e destinos pendentes
  behaviors/                                Entrada animada, rolagem suave, aviso de pendência
  styles/tokens.css                         Cores, tipografia, raios, sombras e movimento
  styles/components/                        Estilos por bloco
scripts/check-site.mjs                      Verificação automatizada
docs/referencia.webp                        Referência visual do modelo
```

## Personalizar

Tudo fica em `src/sites/marina-albuquerque/site.config.js`:

| O quê | Onde |
| --- | --- |
| Nome, função e frase (a frase aparece no desktop) | `brand` |
| Foto da capa, números e botão principal | `hero` |
| Faixas (título, subtítulo, foto, layout, ação) | `banners` — `layout: 'photo-left' \| 'photo-right' \| 'texture'`, `flip: true` espelha a foto |
| Texto e foto do "Quem é" | `about` |
| Serviços | `services` |
| Quadro de dúvidas | `faq` |
| Retrato final | `closing` |
| WhatsApp, agenda, Instagram, site | `contact` |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `tokens.css`) |

Fotos: use o helper `unsplash(id, alt, { ratio, focus })` para imagens de banco ou, para fotos do
cliente, coloque o arquivo em `public/media/` e informe `{ src: '/media/foto.webp', alt, width, height }`.

**Destinos vazios** viram botões que avisam "destino ainda não configurado", em vez de links
inventados. Ações disponíveis:

```js
{ type: 'channel', channel: 'whatsapp' | 'booking' | 'instagram' | 'location' | 'website', message?: '...' }
{ type: 'section', target: 'id-da-secao' }
{ type: 'url', href: 'https://...', label: 'Nome do destino' }
```

**Modo demonstrativo:** com `demo: true`, o rodapé avisa que nome, números e fotos são
ilustrativos. Só desligue depois de trocar tudo por dados reais.

## Publicar na Vercel

Projeto `biosite-03-editorial`, ligado ao repositório com **Root Directory** `modelos/03-editorial`.
Todo push na `main` que altere esta pasta publica automaticamente.

## Conteúdo demonstrativo a substituir

- Fotos: banco de imagens Unsplash. Só havia um retrato desta modelo, então ele se repete em
  recortes diferentes (capa, faixas e encerramento) — o ideal é usar 4 a 5 fotos reais da cliente.
- "+3.500 alunas" e "+14 anos de experiência": ilustrativos.
- Textos de serviços e "Quem é": redigidos para a demonstração.
- Links de WhatsApp, agenda, inscrição, Instagram e site: vazios.
