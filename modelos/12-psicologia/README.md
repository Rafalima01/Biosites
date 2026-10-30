# Modelo 12 · Psicologia

Bio site para psicólogas e terapeutas: cards bege e azul-marinho com elementos 3D suaves (cérebro,
margaridas, balões com coração, carinhas), Ψ grande ao fundo e papel rasgado.
Demonstração: **Helena Duarte · Psicóloga · CRP 00/00000**, São Paulo (marca fictícia).
**Sem sistema de agendamento:** todos os botões de agendar abrem o WhatsApp com a mensagem pronta.

**Composição:** card de abertura bege com a foto (a borda direita some no bege), Ψ grande e clarinho ao
fundo, Ψ + nome + "Psicóloga · CRP", título "Agendamento Online" e botão marrom "Agende sua Consulta",
com balões 3D de coração na divisa; card "Saúde Mental" com a frase enorme em marrom, o cérebro
realista na frente das letras, três margaridas realistas saindo pelas bordas do card e "Terapias &
Abordagens" (abre `/servicos/`); card do Instagram (no print, "Visite nosso Blog") com faixa bege e painel
azul, o cérebro realista de lado apoiado numa mão, selo azul "Saúde Mental em Primeiro Lugar" saindo pela
borda de cima e texto em papel rasgado realista; card "Estamos Localizados" com cérebro em traço ao
fundo, bilhete com o esboço do cérebro preso por tachinha vermelha, "Atendemos até às 19h" em papel
rasgado saindo pela borda e carinhas 3D nos cantos. Os três cards de baixo usam medidas em `cqw`
(proporcionais à largura do card), então mantêm as proporções do print em qualquer tela.
Depois: sobre mim (foto, texto e temas), como funciona (três passos), atendimento online e presencial
(endereço, mapa e horários), chamada final para o WhatsApp e rodapé azul com Ψ, nome e CRP.
Página `/servicos/` com os atendimentos agrupados: tocar abre o WhatsApp com o nome do atendimento.

**Ética (CFP):** a página mostra nome e CRP em todas as telas e **não divulga valores** (o Código de
Ética do Psicólogo veda o preço como forma de propaganda). Os atendimentos têm só nome, descrição e
duração; o `npm run check` falha se aparecer `R$` ou um campo `price`.

No celular é uma coluna só. No desktop o início vira duas colunas: os cards à esquerda e as seções à direita.

Fontes: Poppins (texto, nome e frase grande), Gluten (títulos dos cards azuis, a mais parecida com a do
print) e Fredoka (títulos das categorias em `/servicos/`). Fotos do
Unsplash (licença gratuita), recortadas e entregues em webp pelo servidor de imagens do Unsplash, com
`srcset`. Elementos 3D:

- **Cérebro e margaridas do card "Saúde Mental"** (`public/media/cerebro-real.webp`, `margarida.webp`
  e `margarida-2.webp`): renderizados no Blender por [`scripts/blender/cerebro.py`](../../scripts/blender/cerebro.py)
  e [`scripts/blender/margarida.py`](../../scripts/blender/margarida.py). A margarida é modelada do zero;
  o cérebro vem de um modelo real de ressonância, "3D model of the Brain", de Nevit Dilmen
  ([NIH 3D, 3DPX-003765](https://3d.nih.gov/entries/3DPX-003765)), licença **CC BY-SA 4.0**: a imagem
  pode ser usada comercialmente, desde que o crédito fique no site (`footer.credits`, mostrado no rodapé)
  e a imagem continue com a mesma licença.
- **Cérebro na mão do card do Instagram** (`public/media/cerebro-mao.webp`): [`scripts/blender/cerebro_mao.py`](../../scripts/blender/cerebro_mao.py),
  com o mesmo cérebro (CC BY-SA 4.0, mesmo crédito) e a mão "generic-hand" do pacote
  [@webxr-input-profiles/assets](https://github.com/immersive-web/webxr-input-profiles) (licença MIT), posada no script.
- **Papéis rasgados, bilhete e tachinha** (`papel-faixa.webp`, `papel-nota.webp`, `bilhete.webp`,
  `tachinha-real.webp`): feitos do zero por [`scripts/blender/papel.py`](../../scripts/blender/papel.py)
  e [`scripts/blender/tachinha.py`](../../scripts/blender/tachinha.py). O texto fica no HTML, por cima do papel.
- **Balões, coração e carinhas**: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) da Microsoft (licença MIT).
- **Cérebro em traço** (fundo do card de localização e esboço do bilhete): `public/cerebro-lado.svg`,
  usado como máscara; a cor vem do CSS.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, CRP, ausência de valores, renderização das duas páginas e links
npm run build     # gera /dist (início e /servicos/)
npm run preview   # serve o /dist localmente
```

## Personalizar

Tudo fica em `src/sites/helena-duarte/site.config.js`:

| O quê | Onde |
| --- | --- |
| Nome, profissão e CRP | `brand` |
| Card de abertura (foto, título, botão e mensagem) | `intro` |
| Card "Saúde Mental" (frase grande em duas linhas, título, texto) | `therapies` |
| Card do Instagram (selo em duas linhas, título, texto do papel) | `content` |
| Card da localização (texto e hora do papel de cima, título, texto) | `place` (`note`, `hour`) |
| Sobre mim e temas atendidos | `about` |
| Como funciona | `steps` |
| Atendimento online e presencial | `local` |
| Horários | `schedule` |
| Chamada final | `cta` |
| Atendimentos e mensagem do WhatsApp | `services` e `pages.servicos` (`{servico}` na mensagem; `tag` destaca o atendimento) |
| WhatsApp, Instagram, mapa | `contact` e `social` (rodapé) |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `src/styles/tokens.css`) |

Ações dos cards:

```js
{ type: 'channel', channel: 'whatsapp' | 'instagram' | 'location' | 'website', message?: '...' }
{ type: 'page', href: '/servicos/' }
{ type: 'section', target: 'sobre' | 'local' }
{ type: 'url', href: 'https://...', label: 'Nome do destino' }
```

**Destinos vazios** viram botões que avisam "destino ainda não configurado", em vez de links inventados
(na maquete, o Instagram está vazio de propósito).

**Maquete:** o WhatsApp é fictício (DDD 00), o CRP é 00/00000, o endereço é "Rua Exemplo" e a nota de
demonstração aparece no rodapé enquanto `demo: true`. Para uma cliente real, copie a pasta para
`clientes/<cliente>`, troque os dados (inclusive o CRP verdadeiro) e as fotos e desligue `demo`.

## Publicar na Vercel

Projeto `biosite-12-psicologia` (ainda não criado) · Root Directory `modelos/12-psicologia`.

Publique só quando a pasta mudar, a partir da raiz do repositório (depois do `git push`):
`node scripts/publicar.mjs biosite-12-psicologia`.
