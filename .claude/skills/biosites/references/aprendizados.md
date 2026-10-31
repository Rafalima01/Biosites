# Diário de aprendizados

Registro cronológico do que foi aprendido em cada tarefa (o mais novo em cima). Regra geral que surgir
aqui deve ir também para o SKILL.md ou para a referência certa.

## 2026-10-31 · Site da agência (agencia/vertex-site)

- Pedido sem referência e "sem cara de IA": usar a identidade que a marca já tem (post do Instagram: concreto,
  preto, laranja chapado, condensada em caixa-alta, linhas técnicas, cantos retos) evitou o visual genérico
  (degradê roxo, vidro fosco, emoji, cantos muito arredondados). Copy só com fatos; nada de número inventado.
- "Bio site no celular, site no computador": uma página só, com `.so-celular`/`.so-tela` e as mesmas seções
  adaptadas (no celular: perfil + atalhos, vitrine em carrossel; na tela: menu, abertura, grade).
- Prints dos modelos para vitrine: Edge headless a 500 px com `--force-device-scale-factor=2` dos sites
  publicados (abaixo de 500 px ele ignora a largura). Foto que demora (modelo 03) precisa de
  `--virtual-time-budget` maior. Print comprido (500×2600) + animação `translateY(calc(-100% + 100cqh))`
  dentro da moldura dá o efeito de "site rolando sozinho" sem iframe (os modelos bloqueiam iframe:
  `X-Frame-Options: SAMEORIGIN`).
- Conferir o computador em tamanho real: Edge headless com janela bem alta e o print cortado em partes
  (o painel do app reduz demais). Grade com sobra na última fileira → card de chamada ocupando o resto.

## 2026-10-31 · Modelo 13 · Imobiliária

- Perguntar antes (topo, fotos, destinos) evitou retrabalho: o usuário pediu topo "no estilo", fotos grátis
  recortadas e catálogo numa página `/imoveis/`.
- Folha de contato (miniaturas numeradas numa imagem só) para escolher fotos gastou muito menos que abrir
  uma a uma. O Pexels tinha o "corretor sorrindo segurando casinha" que o Unsplash não tinha.
- Recorte automático local funcionou bem; precisa da limpeza de alfa. Ícones 3D a partir de SVG no
  Blender saíram em poucos ciclos medindo com prints de depuração (posição/dimensão) em vez de renders.
- Corretor: CRECI no topo, no rodapé e no catálogo (o check exige). Valores de imóveis podem aparecer.
- Copiar o modelo mais parecido (12, com cards em cqw) e renomear tokens (marrom→tinta etc.) foi rápido.

## 2026-10-31 · Economia de tokens (pedido do usuário)

- O usuário quer que o limite de uso renda mais. O gasto grande do Modelo 12 veio de: refazer cards
  adaptados, dezenas de prints em branco com o painel oculto, renders abertos um a um em tamanho cheio,
  saídas longas (JSON da Vercel, logs do Blender) e uma conversa muito longa. Regras na seção
  "Economia de contexto" do SKILL.md.

## 2026-10-31 · Modelo 12 · Psicologia (do print ao ar)

- **O usuário quer o print idêntico.** A primeira versão "adaptada" (emojis 3D no lugar de objetos realistas,
  polaroid no lugar do bilhete) foi refeita card a card. Comece já pelo realista quando o print for realista.
- Cérebro realista: modelo de ressonância do NIH (CC BY-SA) renderizado no Blender; crédito no rodapé.
- Margaridas que **saem pelas bordas** do card, como o calendário do Modelo 10 — o usuário pede esse efeito.
- Fonte dos títulos quirky do print: Gluten (achada comparando 19 fontes numa página de teste).
- Mão: a do WebXR deformou ("a mão tá toda deformada"); a do MakeHuman (CC0) ficou realista. A palma
  estava invertida na primeira tentativa — confirmar a palma com vistas antes de montar a cena.
- "Cérebro flutuando na mão" = palma para cima, em concha, **sem encostar** (o usuário explicou depois).
- Psicologia: CRP sempre visível, sem preços (CFP).

## 2026-10 · Modelos 10 e 11 · Barbearia

- Calendário 3D: o ângulo foi errado várias vezes até medir a imagem de referência (silhueta + forma dos
  números juntos) e casar a cor por pixel. Não entregar ângulo "no olho".
- Figma foi testado e descartado: elementos não ficam clicáveis. O usuário prefere o site em código.
- Modelo "com agenda" = mesma identidade do básico + página `/agendar/` do Sistema de Agendamento.
