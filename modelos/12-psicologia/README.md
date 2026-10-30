# Modelo 12 · Psicologia

Bio site para psicólogas e terapeutas: cards bege e azul-marinho com elementos 3D suaves (cérebro,
margaridas, balões com coração, carinhas), Ψ grande ao fundo e papel rasgado.
Demonstração: **Helena Duarte · Psicóloga · CRP 00/00000**, São Paulo (marca fictícia).
**Sem sistema de agendamento:** todos os botões de agendar abrem o WhatsApp com a mensagem pronta.

**Composição:** card de abertura bege com a foto (a borda direita some no bege), Ψ grande e clarinho ao
fundo, Ψ + nome + "Psicóloga · CRP", título "Agendamento Online" e botão marrom "Agende sua Consulta",
com balões 3D de coração na divisa; card "Saúde Mental" com a frase enorme em marrom por cima do
cérebro 3D, margaridas nos cantos e "Terapias & Abordagens" (abre `/servicos/`); card azul do Instagram
com faixa bege e cérebro 3D, selo "Saúde mental em primeiro lugar" com carinha, título arredondado e
texto em papel rasgado; card azul "Onde me encontrar" com cérebro em traço ao fundo, polaroid do
consultório presa por tachinha, nota "Atendo até às 19h" em papel rasgado e carinhas 3D.
Depois: sobre mim (foto, texto e temas), como funciona (três passos), atendimento online e presencial
(endereço, mapa e horários), chamada final para o WhatsApp e rodapé azul com Ψ, nome e CRP.
Página `/servicos/` com os atendimentos agrupados: tocar abre o WhatsApp com o nome do atendimento.

**Ética (CFP):** a página mostra nome e CRP em todas as telas e **não divulga valores** (o Código de
Ética do Psicólogo veda o preço como forma de propaganda). Os atendimentos têm só nome, descrição e
duração; o `npm run check` falha se aparecer `R$` ou um campo `price`.

No celular é uma coluna só. No desktop o início vira duas colunas: os cards à esquerda e as seções à direita.

Fontes: Poppins (texto, nome e frase grande) e Fredoka (títulos arredondados dos cards azuis). Fotos do
Unsplash (licença gratuita), recortadas e entregues em webp pelo servidor de imagens do Unsplash, com
`srcset`. Elementos 3D: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) da Microsoft
(licença MIT), em `public/media/`; o cérebro e a margarida recebem filtros de cor no CSS
(`--filtro-cerebro` e `--filtro-flor` em `src/styles/tokens.css`) para combinar com o bege.
O cérebro em traço do card de localização é `public/cerebro-traco.svg`.

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
| Card do Instagram (selo, título, texto do papel) | `content` |
| Card da localização (nota do horário, título, texto, foto da polaroid) | `place` |
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
