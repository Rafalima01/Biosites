# Modelo 01 · Essencial

Modelo inicial e mais simples da biblioteca de bio sites da agência. Demonstração: **Studio Suelen
Bezerra — Nail Designer**.

Página web real (não um mockup), pré-renderizada a partir de um arquivo de configuração, com
JavaScript mínimo (~3 kB) apenas para os comportamentos.

**Composição:** apresentação com foto + monograma, cinco cards de navegação, seções de
procedimentos e galeria com visualização ampliada, rodapé com redes. Estética de luxo discreto
(creme, nude, marrom e dourado envelhecido).

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, renderização e geração de links
npm run build     # gera /dist (HTML estático pronto para qualquer hospedagem)
npm run preview   # serve o /dist localmente
```

## Estrutura

```
index.html                         Casca HTML (o conteúdo é injetado pelo plugin do Vite)
vite.config.js                     Plugin de pré-renderização (dev e build)
public/media/                      Fotografias e mídias locais
src/
  sites/
    index.js                       Escolhe o site ativo
    studio-suelen-bezerra/
      site.config.js               Conteúdo, links, cards, seções, galeria e tema do cliente
  components/                      Componentes que geram HTML a partir da config
    Intro.js  Monogram.js  LinkCards.js  Sections.js  Footer.js  icons.js
  lib/
    links.js                       WhatsApp, Instagram, Maps, site e destinos pendentes
    html.js                        Escape de HTML e atributos
  behaviors/                       Comportamentos no navegador
    reveal.js  scroll.js  toast.js  lightbox.js
  styles/
    tokens.css                     Cores, tipografia, sombras, raios e movimento
    base.css                       Reset, utilitários, ornamento, botão, animações
    components/                    Estilos por componente
  render.js                        Monta <head> e <body> da página
scripts/check-site.mjs             Verificação automatizada
docs/referencia.webp               Referência visual do modelo
```

## Personalizar este cliente

Tudo fica em `src/sites/studio-suelen-bezerra/site.config.js`:

| O quê | Onde |
| --- | --- |
| WhatsApp e mensagens pré-preenchidas | `contact.whatsapp.number` / `.message`, `contact.booking.message` |
| Sistema de agenda externo (opcional) | `contact.booking.url` (vazio = agenda pelo WhatsApp) |
| Instagram | `contact.instagram.handle` |
| Localização | `contact.location.address` ou `contact.location.mapsUrl` |
| Site | `contact.website.url` |
| Fotografia principal | `brand.portrait` (arquivo em `public/media/`) |
| Monograma / logotipo | `brand.monogram.letters` ou `brand.monogram.src` |
| Cards (texto, ícone, ação, ordem) | `cards` |
| Procedimentos e galeria | `sections` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `tokens.css`) |

**Destinos vazios** são tratados como “não configurados”: o botão continua visível, mas ao ser
tocado mostra um aviso em vez de abrir um link inventado. No modo dev, a lista de pendências
aparece no console e o `npm run check` também a informa.

Ações disponíveis para cards e CTAs:

```js
{ type: 'channel', channel: 'whatsapp' | 'booking' | 'instagram' | 'location' | 'website', message?: '...' }
{ type: 'section', target: 'id-da-secao' }
{ type: 'url', href: 'https://...' }
```

## Criar um novo cliente

1. Duplique `src/sites/studio-suelen-bezerra/` com o nome do novo cliente.
2. Edite o `site.config.js` (conteúdo, cards, seções, tokens de tema e fontes).
3. Aponte `src/sites/index.js` para a nova pasta.
4. Se a identidade pedir uma composição diferente, crie novos componentes/seções
   (registre o tipo em `RENDERERS`, em `src/components/Sections.js`) em vez de forçar o layout atual.
5. Rode `npm run check` e `npm run build`.

## Publicar na Vercel

O arquivo `vercel.json` já define build (`npm run check && npm run build`), saída (`dist`), cache
dos assets e cabeçalhos de segurança.

1. Na Vercel: **Add New → Project** e importe o repositório da biblioteca.
2. Em **Root Directory**, selecione `modelos/01-essencial`. O framework (Vite) é detectado.
3. **Deploy**.
4. Em **Settings → Domains**, adicione o domínio do cliente e configure o DNS conforme a Vercel indicar
   (registro `A` para o domínio raiz ou `CNAME` para o `www`).
5. Preencha `meta.siteUrl` no `site.config.js` com o domínio final (gera URL canônica e `og:image`
   absoluto) e faça um novo push.

A cada push na branch principal a Vercel publica de novo. Se o projeto for criado pela CLI,
rode `vercel` dentro desta pasta.

## Mídias demonstrativas

- `public/media/suelen-portrait.webp`: recortada da imagem de referência — substituir pela foto real
  (proporção retrato, ~3:5, pessoa à esquerda e fundo claro funcionam melhor com o esfumado).
- Galeria: fotos ilustrativas do Unsplash carregadas por URL — substituir pelos trabalhos reais.
- Lista de procedimentos: demonstrativa — substituir pelos serviços reais.
