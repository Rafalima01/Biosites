# Vertex Labs · Bio site da agência

Bio site da própria agência, com a identidade da Vertex Labs (preto, branco e o degradê
laranja→vermelho do símbolo). Estrutura inspirada na referência enviada, sem a seção de cursos.

**Conteúdo:** topo com a marca, seletor **PT/EN** e botão de **tema claro/escuro**; símbolo em anel
laranja, status "Disponível para novos projetos", nome, @vertexlabs.io, slogan "Construímos o que
ainda não existe." (do post da marca), apresentação e redes; botão de destaque **Solicitar
orçamento** (WhatsApp com mensagem pronta no idioma escolhido); **O que fazemos** (bio sites,
landing pages e sistemas sob medida, cada um abrindo o WhatsApp com a mensagem do serviço);
**Portfólio** em abas (Bio sites com os 6 modelos publicados; Landing pages e Sistemas como
"em breve") e rodapé.

No desktop o perfil fica fixo à esquerda e serviços + portfólio à direita.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # traduções completas, arquivos, renderização e links
npm run build     # gera /dist
```

Na URL, `?lang=en` e `?theme=light` abrem o site já no idioma/tema (útil para compartilhar).

## Onde editar

Tudo em `src/sites/vertex-labs/site.config.js`. Todo texto visível é `{ pt, en }` — o
`npm run check` acusa tradução faltando.

| O quê | Onde |
| --- | --- |
| Status, função, slogan, apresentação | `brand` |
| WhatsApp, Instagram, e-mail, site | `contact` (contato vazio fica oculto) |
| Redes exibidas | `socials` |
| Botão de orçamento e mensagem | `cta` |
| Serviços | `services.items` |
| Portfólio | `portfolio.categories` — para incluir landing pages e sistemas, adicione itens em `items` |

### Adicionar um projeto ao portfólio

1. Salve a imagem em `public/media/portfolio/` (print de celular, proporção ~9:19,5, 600 px de largura).
2. Adicione em `portfolio.categories[n].items`:
   `{ title: 'Nome', segment: { pt: 'Segmento', en: 'Segment' }, image: '/media/portfolio/arquivo.webp', href: 'https://...' }`

Os prints atuais foram gerados com o Chrome em modo headless a partir dos sites publicados.

## Marca

`public/media/vertex-mark.svg` é o símbolo redesenhado em vetor a partir do arquivo enviado
(`docs/logo-original.webp`), com fundo transparente. Se houver um SVG oficial, basta substituir
o arquivo. `favicon.png` e `vertex-mark-1200.png` (imagem de compartilhamento) foram gerados a partir dele.

## Publicação

Projeto Vercel `vertexlabs`, ligado ao repositório com **Root Directory** `agencia/vertex-labs`.
Produção: https://vertexlabs-omega.vercel.app

## Pendências

- E-mail de contato (o ícone aparece sozinho quando `contact.email.address` for preenchido).
- Domínio próprio: adicionar na Vercel e preencher `meta.siteUrl`.
- Landing pages e sistemas no portfólio.
