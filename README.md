# Biblioteca de Bio Sites Premium

Modelos de bio sites personalizados da agência. Cada modelo é um projeto independente, com
nome próprio e pasta separada em `modelos/`, e é publicado na Vercel como um projeto separado
(apontando o **Root Directory** para a pasta do modelo).

## Modelos

| # | Nome | Pasta | Demonstração | Descrição |
| --- | --- | --- | --- | --- |
| 01 | **Essencial** | [`modelos/01-essencial`](modelos/01-essencial) | Studio Suelen Bezerra · Nail Designer | Modelo inicial e mais simples: foto + monograma, 5 cards de navegação, procedimentos, galeria e rodapé. Luxo discreto em creme, nude e dourado. |
| 02 | **Autoridade** | [`modelos/02-autoridade`](modelos/02-autoridade) | Agatha Rigazzi · Mentora de negócios | Para especialistas que vendem conhecimento: prova social sobre a foto, cards com foto alternando bege/chocolate, "Quem é", serviços, depoimentos e chamada final. Creme, bege e chocolate com Poppins. |
| 03 | **Editorial** | [`modelos/03-editorial`](modelos/03-editorial) | Marina Albuquerque · Mentora de marketing digital | Linguagem de revista: nome em serifa sobre a foto, números com botão, faixas de foto e cetim, "Quem é" em duotone, serviços e retrato final. Azul-marinho com Playfair Display. |
| 04 | **Compacto** | [`modelos/04-compacto`](modelos/04-compacto) | Bianca Moraes · Designer de sobrancelhas | Cartão de visita digital em uma tela: foto do studio, retrato em moldura circular, monograma, quatro botões, painéis de Serviços/Sobre e barra de redes. Marrom, creme e bege. |
| 05 | **Premium** | [`modelos/05-premium`](modelos/05-premium) | Larissa Prado · Estrategista digital | Vitrine de produtos digitais: capa clara com linhas douradas e foto, cards de vidro sobre fundo dourado com imagem saltando para fora e botão de acesso. Creme e dourado com Bodoni Moda. |
| 06 | **Delivery** | [`modelos/06-delivery`](modelos/06-delivery) | Brasa & Massa Pizza (marca fictícia) | Para restaurantes e delivery: carrossel de sabores, selo da marca, horário com "aberto agora" em tempo real e botões por canal (app de delivery, cardápio, endereço, WhatsApp). Escuro com amarelo. |
| 08 | **Glam** | [`modelos/08-glam`](modelos/08-glam) | Rosé Nail Studio · Nail designer (marca fictícia) | Cara de app: cartões de vidro fosco sobre foto, letreiro em neon, serviço em destaque e galeria de inspirações com filtros, curtir e escolher; as escolhidas vão na mensagem do WhatsApp. Rosa com Poiret One e Poppins. |
| 09 | **Delicado** | [`modelos/09-delicado`](modelos/09-delicado) | Mantha Beauty Studio · Samantha Carvalho (teste com dados reais) | Rosa claro com assinatura manuscrita: foto com nome em duas cores, cards com ícone em bloco rosa, sobre mim, "como posso te ajudar", faixa de agendamento, trabalhos, dúvidas frequentes, página de serviços e agendamento online (calendário com horários livres da agenda do Google, sinal de 30% por Pix e envio pelo WhatsApp). Playfair Display, Allura e Montserrat. |

## Clientes

Projetos reais, copiados de um modelo para uma pasta própria em `clientes/` (cada um vira um projeto Vercel).

| Cliente | Pasta | Modelo | Situação |
| --- | --- | --- | --- |
| Jailane Ferreira · nail designer e mentora | [`clientes/jailane-ferreira`](clientes/jailane-ferreira) | 02 · Autoridade | 3 páginas: início, `/servicos/` (16 serviços com valores) e `/mentoria/` (aguardando textos) |
| Samantha Carvalho · Mantha Beauty Studio | [`clientes/mantha-beauty-studio`](clientes/mantha-beauty-studio) | 08 · Glam | 2 páginas: início (galeria com 4 fotos de trabalhos e contato) e `/servicos/` (7 serviços com agendamento por serviço no WhatsApp) |

## Site da agência

| Projeto | Pasta | Descrição |
| --- | --- | --- |
| **Vertex Labs** | [`agencia/vertex-labs`](agencia/vertex-labs) | Bio site da própria agência: orçamento, serviços e portfólio com os modelos acima. PT/EN e tema claro/escuro. |

## Anúncios

| Projeto | Pasta | Descrição |
| --- | --- | --- |
| **Anúncios em motion** | [`anuncios/vertex-motion`](anuncios/vertex-motion) | 4 vídeos 9:16 (Reels/Stories) narrados para captar clientes de bio sites e landing pages: voz da ElevenLabs, legenda palavra a palavra, trilha e efeitos, mais o guia de copy e campanha. Feitos em Remotion. |

## Convenções

- Novo modelo → nova pasta `modelos/NN-nome` (número sequencial + nome curto em minúsculas, sem acentos).
- Cada modelo tem seu próprio `package.json`, `vercel.json` e `README.md`, e pode ter layout e
  identidade próprios; não é obrigatório reaproveitar os cinco cards do Essencial.
- Conteúdo de cada cliente fica em `src/sites/<cliente>/site.config.js` dentro do modelo.
- Registre o novo modelo na tabela acima.

## Rodar um modelo

```bash
cd modelos/01-essencial
npm install
npm run dev
```

## Publicar na Vercel

Cada modelo é um projeto Vercel ligado a este repositório (branch `main`), com **Root Directory**
apontando para a pasta do modelo. Todo push na `main` publica automaticamente; o `ignoreCommand`
do `vercel.json` pula o build quando o push não altera a pasta daquele modelo.

| Modelo | Projeto Vercel | Produção |
| --- | --- | --- |
| 01 · Essencial | `biosite-01-essencial` | https://biosite-01-essencial.vercel.app |
| 02 · Autoridade | `biosite-02-autoridade` | https://biosite-02-autoridade.vercel.app |
| 03 · Editorial | `biosite-03-editorial` | https://biosite-03-editorial.vercel.app |
| 04 · Compacto | `biosite-04-compacto` | https://biosite-04-compacto.vercel.app |
| 05 · Premium | `biosite-05-premium` | https://biosite-05-premium.vercel.app |
| 06 · Delivery | `biosite-06-delivery` | https://biosite-06-delivery.vercel.app |
| 08 · Glam | `biosite-08-glam` | (ainda não publicado) |
| 09 · Delicado | `biosite-09-delicado` | https://biosite-09-delicado.vercel.app (publicado pela CLI, branch `modelo-09-delicado`) |
| Agência · Vertex Labs | `vertexlabs` | https://vertexlabs-omega.vercel.app |
| Cliente · Jailane Ferreira | `biosite-jailane-ferreira` | https://biosite-jailane-ferreira.vercel.app |
| Cliente · Mantha Beauty Studio | `biosite-mantha-beauty-studio` | https://biosite-mantha-beauty-studio.vercel.app (publicado pela CLI, branch `modelo-08-glam`) |

Novo modelo: **Add New → Project**, importe este repositório, defina o **Root Directory**
(`modelos/NN-nome`), faça o deploy e adicione o domínio do cliente em **Settings → Domains**.

Publicação manual pela CLI: rode a partir da **raiz do repositório** (o Root Directory já aponta
para a pasta do modelo), por exemplo `vercel deploy --prod --cwd .` após `vercel link --project biosite-02-autoridade`.
