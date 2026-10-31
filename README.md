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
| 07 | **Hospedagem** | [`modelos/07-hospedagem`](modelos/07-hospedagem) | Maré Mansa · Casas de temporada (marca fictícia) | Reserva direta para casas de temporada: casas com fotos e valores, pacotes de datas especiais, agenda interativa com preço por dia e reserva pronta no WhatsApp, sem taxa de plataforma. Areia, oceano e coral. |
| 08 | **Glam** | [`modelos/08-glam`](modelos/08-glam) | Rosé Nail Studio · Nail designer (marca fictícia) | Cara de app: cartões de vidro fosco sobre foto, letreiro em neon, serviço em destaque e galeria de inspirações com filtros, curtir e escolher; as escolhidas vão na mensagem do WhatsApp. Rosa com Poiret One e Poppins. |
| 09 | **Delicado** | [`modelos/09-delicado`](modelos/09-delicado) | Lívia Martins · Studio Lívia Beauty (marca fictícia) | Rosa claro com assinatura manuscrita: foto com nome em duas cores, cards com ícone em bloco rosa, sobre mim, "como posso te ajudar", faixa de agendamento, trabalhos, dúvidas frequentes, página de serviços e agendamento online ligado ao Sistema de Agendamento (studio de demonstração: horários livres, sinal de 30% por Pix, agendamento gravado no painel e envio pelo WhatsApp). Playfair Display, Allura e Montserrat. |
| 10 | **Barbearia** | [`modelos/10-barbearia`](modelos/10-barbearia) | Marcos Ferraz · Ferraz Barber Club (marca fictícia) | Foto do barbeiro com tom quente e linha laranja, fundo cobre com ferramentas em traço preto, nome em serifa + manuscrita e cards grafite com borda laranja e botão em pílula (calendário 3D em grafite e dourado com o dia de hoje, estilo, serviços com selo, espaço), sobre, cortes da semana, o espaço com horários e página de serviços. Sem sistema: tudo agenda pelo WhatsApp com o nome do serviço. DM Serif Display, Great Vibes e Poppins. |
| 11 | **Barbearia com agenda** | [`modelos/11-barbearia-agenda`](modelos/11-barbearia-agenda) | Marcos Ferraz · Ferraz Barber Club (marca fictícia) | O Modelo 10 com o agendamento online do Sistema de Agendamento: página `/agendar/` com horários livres, sinal de 30% por Pix e agendamento gravado no painel (studio de demonstração `ferraz-barber`), na identidade da barbearia. O 10 é a versão básica, este é a versão com agenda. |
| 12 | **Psicologia** | [`modelos/12-psicologia`](modelos/12-psicologia) | Helena Duarte · Psicóloga · CRP 00/00000 (marca fictícia) | Para psicólogas e terapeutas: cards bege e azul-marinho com elementos 3D suaves (cérebro, margaridas, balões com coração), Ψ grande ao fundo, papel rasgado e polaroid. Sem agenda: tudo abre o WhatsApp. Mostra o CRP e não divulga valores (Código de Ética do CFP). |
| 13 | **Imobiliária** | [`modelos/13-imobiliaria`](modelos/13-imobiliaria) | Rafael Monteiro · Corretor de Imóveis · CRECI 00000-F (marca fictícia) | Para corretores e imobiliárias: cards azul, laranja, cinza e claro com fotos recortadas saindo pela borda e ícones 3D (consultoria, catálogo, contato, visitas), topo com CRECI e página `/imoveis/` com catálogo (venda e locação, cada imóvel abre o WhatsApp com o código). Sem agenda. |

## Sistemas

Produtos com banco de dados e painel, além da vitrine.

| Sistema | Pasta | Descrição |
| --- | --- | --- |
| **Hospedagem · reserva direta** | [`sistemas/hospedagem`](sistemas/hospedagem) | Site + reservas com Pix para casas de temporada: agenda com disponibilidade real, reserva fechada no site, QR Code Pix do sinal e painel do anfitrião (reservas, agenda, casas e fotos, promoções, pacotes, personalização). Next.js + Supabase, uma cópia por cliente. |
| **Agendamento · studios de beleza** | [`sistemas/agendamento`](sistemas/agendamento) | Agenda própria no lugar do Google Agenda: horários livres pelo expediente, sinal por Pix com horário segurado e painel da dona no celular (agenda do dia, confirmar sinal, encaixe, bloqueios). Um banco Supabase para todos os studios. Etapa 1 no ar (Supabase instalado, Samantha cadastrada); falta ligar o site dela. |

## Ferramentas

| Ferramenta | Pasta | Descrição |
| --- | --- | --- |
| **Calendário 3D (Blender)** | [`scripts/blender/calendario.py`](scripts/blender/calendario.py) | Gera o calendário 3D em PNG sem fundo, com qualquer número e as cores da marca (grafite e dourado por padrão). Precisa do Blender instalado; uso no topo do arquivo. |
| **Selo 3D com tesoura (Blender)** | [`scripts/blender/selo.py`](scripts/blender/selo.py) | Placa laranja com tesoura em relevo, no mesmo estilo, luz e ângulo do calendário 3D. Cores por opção (`--placa`, `--tesoura`, `--dourado`). |
| **Cérebro, margarida, mão, papel e tachinha (Blender)** | [`scripts/blender/`](scripts/blender) | Elementos realistas do Modelo 12: `cerebro.py`, `margarida.py`, `cerebro_mao.py`, `papel.py` (papel amassado e rasgado) e `tachinha.py`. Licenças e uso no topo de cada arquivo. |
| **Recorte, limpeza e WebP** | [`scripts/imagens/`](scripts/imagens) e [`scripts/blender/webp.py`](scripts/blender/webp.py) | `recorta.ps1` recorta pelo fundo transparente e redimensiona; `limpa-alfa.ps1` limpa restos de fundo de recortes automáticos; `webp.py` converte para WebP com as cores fiéis. |
| **Ícones 3D e casa na ilha (Blender)** | [`scripts/blender/icone3d.py`](scripts/blender/icone3d.py), [`casa_ilha.py`](scripts/blender/casa_ilha.py) | Escudo com visto e selo do WhatsApp a partir de SVG, e casa sobre ilha de grama (Modelo 13). |
| **Skill `biosites`** | [`.claude/skills/biosites`](.claude/skills/biosites) | Manual e diário de aprendizados do Claude para criar, ajustar e publicar os bio sites. Atualizado ao fim de cada tarefa. |

## Clientes

Projetos reais, copiados de um modelo para uma pasta própria em `clientes/` (cada um vira um projeto Vercel).

| Cliente | Pasta | Modelo | Situação |
| --- | --- | --- | --- |
| Jailane Ferreira · nail designer e mentora | [`clientes/jailane-ferreira`](clientes/jailane-ferreira) | 02 · Autoridade | 3 páginas: início, `/servicos/` (16 serviços com valores) e `/mentoria/` (aguardando textos) |
| Samantha Carvalho · Mantha Beauty Studio | [`clientes/mantha-beauty-studio`](clientes/mantha-beauty-studio) | 09 · Delicado | Cores dela (roxo ameixa, dourado e creme); início, `/servicos/` e `/agendar/` (horários livres e sinal por Pix). Agenda ligada ao sistema (sinal por Pix na chave dela) |

## Site da agência

| Projeto | Pasta | Descrição |
| --- | --- | --- |
| **Vertex Labs** | [`agencia/vertex-labs`](agencia/vertex-labs) | Bio site da própria agência: orçamento, serviços e portfólio com os modelos acima. PT/EN e tema claro/escuro. |
| **Vertex Labs · site** | [`agencia/vertex-site`](agencia/vertex-site) | Site da agência e vitrine dos bio sites: no celular abre como bio site, no tablet e no computador como site completo. 13 modelos com prints reais e filtros, clientes no ar, agenda online, comparação e dúvidas. |

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

Cada modelo e cada cliente é um projeto Vercel ligado a este repositório, com **Root Directory**
apontando para a própria pasta.

**A publicação é sempre manual, um projeto por vez.** A conta está no plano grátis (limite de 100
publicações por dia) e, quando cada push publicava sozinho, uma única mudança gerava uma tentativa em
todos os projetos e esgotava o limite. Por isso todo `vercel.json` tem `"git": { "deploymentEnabled": false }`:
o push só guarda o código no GitHub, e nada vai para o ar sozinho.

Para publicar, envie as mudanças (`git push`) e rode, na raiz do repositório, só para o projeto que mudou:

```bash
node scripts/publicar.mjs biosite-jailane-ferreira
```

O script pede à Vercel uma publicação daquele projeto a partir da `main` e espera ficar no ar.
Antes de publicar, confira quais pastas mudaram (`git diff --stat`) e publique só os projetos delas.

| Modelo | Projeto Vercel | Produção |
| --- | --- | --- |
| 01 · Essencial | `biosite-01-essencial` | https://biosite-01-essencial.vercel.app |
| 02 · Autoridade | `biosite-02-autoridade` | https://biosite-02-autoridade.vercel.app |
| 03 · Editorial | `biosite-03-editorial` | https://biosite-03-editorial.vercel.app |
| 04 · Compacto | `biosite-04-compacto` | https://biosite-04-compacto.vercel.app |
| 05 · Premium | `biosite-05-premium` | https://biosite-05-premium.vercel.app |
| 06 · Delivery | `biosite-06-delivery` | https://biosite-06-delivery.vercel.app |
| 07 · Hospedagem | `biosite-07-hospedagem` | https://biosite-07-hospedagem.vercel.app |
| 08 · Glam | `biosite-08-glam` | https://biosite-08-glam.vercel.app |
| 09 · Delicado | `biosite-09-delicado` | https://biosite-09-delicado.vercel.app |
| 10 · Barbearia | `biosite-10-barbearia` | https://biosite-10-barbearia.vercel.app |
| 11 · Barbearia com agenda | `biosite-11-barbearia-agenda` | https://biosite-11-barbearia-agenda.vercel.app |
| 12 · Psicologia | `biosite-12-psicologia` | https://biosite-12-psicologia.vercel.app |
| 13 · Imobiliária | `biosite-13-imobiliaria` | https://biosite-13-imobiliaria.vercel.app |
| Agência · site Vertex | `vertexlabs-site` | https://vertexlabs-site-green.vercel.app |
| Agência · Vertex Labs | `vertexlabs` | https://vertexlabs-omega.vercel.app |
| Cliente · Jailane Ferreira | `biosite-jailane-ferreira` | https://biosite-jailane-ferreira.vercel.app |
| Cliente · Mantha Beauty Studio | `biosite-mantha-beauty-studio` | https://biosite-mantha-beauty-studio.vercel.app |
| Sistema · Hospedagem | `sistema-hospedagem` | https://sistema-hospedagem.vercel.app |
| Sistema · Agendamento (painel) | `sistema-agendamento` | https://sistema-agendamento-sand.vercel.app |

Novo modelo: **Add New → Project**, importe este repositório, defina o **Root Directory**
(`modelos/NN-nome`), faça o deploy e adicione o domínio do cliente em **Settings → Domains**.

