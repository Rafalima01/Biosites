# Vertex Labs · Bio site da agência

Bio site da própria agência, com a identidade da Vertex Labs (preto, branco e o degradê
laranja→vermelho do símbolo). Duas páginas: **início** (`/`) e **portfólio completo** (`/portfolio/`).

## Página inicial

- Topo com a marca, seletor **PT/EN** e botão de **tema claro/escuro** (a escolha fica salva).
- Perfil: símbolo em anel laranja, status, nome, @vertexlabs.io, slogan "Construímos o que ainda
  não existe.", apresentação e redes.
- **Solicitar orçamento** → abre a janela "Qual serviço você precisa?" com Página de vendas, Site
  institucional, Bio site, Vídeo em motion e Outro projeto. Cada opção abre o WhatsApp com a
  mensagem do serviço (no idioma escolhido).
- Lista numerada:
  - **01 Site da Vertex** — desativado, com selo "Em breve", até o site existir.
  - **02 Portfólio completo** — abre `/portfolio/`.
  - **03 Sistema sob medida** — abre uma janela com nome (opcional) e resumo do projeto; ao enviar,
    a mensagem segue para o WhatsApp.
- **Portfólio** (resumo): abas por categoria e link **Ver completo**. Os cards mostram só a imagem.

## Portfólio completo (`/portfolio/`)

Título, filtros (Todos, Bio sites, Landing pages, Sistemas) e cada projeto com imagem, ano,
segmento, descrição e tags. Botão voltar no topo e botões flutuantes de "voltar ao topo" e
"Orçamento".

No desktop, a página inicial fica em duas colunas (perfil fixo à esquerda) e o portfólio em grade.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173 e http://localhost:5173/portfolio/
npm run check     # traduções, arquivos, páginas, janelas e links
npm run build     # gera /dist (index.html + portfolio/index.html)
```

Na URL, `?lang=en` e `?theme=light` abrem o site já no idioma/tema.

## Onde editar

Tudo em `src/sites/vertex-labs/site.config.js`. Todo texto visível é `{ pt, en }` — o
`npm run check` acusa tradução faltando.

| O quê | Onde |
| --- | --- |
| Status, função, slogan, apresentação | `brand` |
| WhatsApp, Instagram, e-mail, site | `contact` (contato vazio fica oculto) |
| Opções e mensagens do orçamento | `quote.options` |
| Lista 01–03 | `links` (`action`: `dialog`, `page` ou `url`; `url` vazia = "Em breve") |
| Textos da janela de sistema sob medida | `systemForm` |
| Projetos do portfólio | `portfolio.items` (`category`, `title`, `year`, `segment`, `image`, `description`, `tags`) |
| Textos da página de portfólio | `portfolioPage` |

### Adicionar um projeto ao portfólio

1. Salve a imagem em `public/media/portfolio/` (print de celular, proporção ~9:19,5, 600 px de largura).
2. Adicione em `portfolio.items` com `category: 'bio-sites' | 'landing-pages' | 'sistemas'`.
   O projeto aparece no resumo da página inicial e no portfólio completo.

Quando o site da Vertex estiver no ar, preencha o `href` do item "Site da Vertex" em `links`.

## Marca

`public/media/vertex-mark.svg` é o símbolo redesenhado em vetor a partir do arquivo enviado
(`docs/logo-original.webp`), com fundo transparente. Se houver um SVG oficial, basta substituir
o arquivo. `favicon.png` e `vertex-mark-1200.png` (imagem de compartilhamento) foram gerados a partir dele.

## Publicação

Projeto Vercel `vertexlabs`, ligado ao repositório com **Root Directory** `agencia/vertex-labs`.
Produção: https://vertexlabs-omega.vercel.app

## Pendências

- E-mail de contato (o ícone aparece sozinho quando `contact.email.address` for preenchido).
- Endereço do site da Vertex (item 01 da lista).
- Domínio próprio: adicionar na Vercel e preencher `meta.siteUrl`.
- Landing pages e sistemas no portfólio.
