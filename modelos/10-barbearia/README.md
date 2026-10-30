# Modelo 10 · Barbearia

Bio site escuro para barbeiros e barbearias, em café, âmbar e laranja queimado, com clima de barbearia
clássica (luz dourada de spots e textura de ferramentas desenhadas em linha no fundo).
Demonstração: **Marcos Ferraz · Ferraz Barber Club**, Rio de Janeiro (marca fictícia).
**Sem sistema de agendamento:** todos os botões de agendar abrem o WhatsApp com a mensagem pronta.

**Composição:** foto do barbeiro que se dissolve no fundo, rótulo espaçado ("BARBEIRO · RJ"), nome em
serifa clássica + sobrenome em manuscrita dourada e setinha dupla; quatro cards grandes (texto e botão
em pílula laranja de um lado, foto do outro, alternando): "Agende seu corte" com folhinha 3D que mostra
o dia de hoje, "Estilo e tendências", "Serviços e valores" com selo laranja e "Conheça o espaço";
"Sobre o Marcos" com três destaques; cortes da semana; o espaço (foto, comodidades, horários,
endereço e mapa); chamada final para o WhatsApp; rodapé com o nome em manuscrita e os canais.
Página `/servicos/` com as categorias (cabelo, barba, combos, química e tratamento): tocar no serviço
abre o WhatsApp com o nome e o valor dele.

No celular é uma coluna só. No desktop o início vira duas colunas: o "celular" (topo e cards) à esquerda
e as seções à direita.

Fontes: DM Serif Display (nome e títulos), Great Vibes (manuscrita), Oswald (títulos dos cards e
rótulos) e Montserrat (texto). Fotos do Unsplash (licença gratuita), recortadas e entregues em webp pelo
servidor de imagens do Unsplash, com `srcset`. Calendário 3D: `public/media/calendario-3d.png`, do
[Fluent Emoji](https://github.com/microsoft/fluentui-emoji) da Microsoft (licença MIT, uso livre inclusive
comercial), recolorido para laranja e creme no CSS (`.cal3d` em `cards.css`), com o dia de hoje por cima.
Os outros emojis 3D do Fluent (tesoura, poste de barbearia, relógio) podem ser usados do mesmo jeito.

A foto do topo tem um fade na base (`mask-image` em `.hero__media`): ela some aos poucos e revela o fundo
da página, sem emenda com os cards, como no site da Jailane.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, renderização das duas páginas e links
npm run build     # gera /dist (início e /servicos/)
npm run preview   # serve o /dist localmente
```

## Personalizar

Tudo fica em `src/sites/marcos-ferraz/site.config.js`:

| O quê | Onde |
| --- | --- |
| Nome, sobrenome (manuscrita), nome da barbearia e rótulo do topo | `brand` |
| Foto do topo | `hero.photo` |
| Cards grandes (título, texto, botão, foto ou `art: 'calendar'`, selo, ação) | `cards` |
| Sobre o barbeiro e destaques | `about` |
| Cortes da semana | `gallery` |
| O espaço (foto, comodidades, endereço) | `space` |
| Horários | `schedule` |
| Chamada final | `cta` |
| Serviços, valores e mensagem do WhatsApp | `services` e `pages.servicos` (`{servico}` e `{valor}` na mensagem; `from: true` mostra "a partir de"; `tag` destaca o serviço) |
| WhatsApp, Instagram, mapa | `contact` e `social` (rodapé) |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `src/styles/tokens.css`) |

Ações dos cards:

```js
{ type: 'channel', channel: 'whatsapp' | 'instagram' | 'location' | 'website', message?: '...' }
{ type: 'page', href: '/servicos/' }
{ type: 'section', target: 'sobre' | 'cortes' | 'espaco' }
{ type: 'url', href: 'https://...', label: 'Nome do destino' }
```

**Destinos vazios** viram botões que avisam "destino ainda não configurado", em vez de links inventados
(na maquete, o Instagram está vazio de propósito).

**Maquete:** o WhatsApp é fictício (DDD 00), o endereço é "Rua Exemplo" e a nota de demonstração aparece
no rodapé enquanto `demo: true`. Para um cliente real, copie a pasta para `clientes/<cliente>`, troque
os dados e as fotos e desligue `demo`.

## Publicar na Vercel

Ainda não publicado. Precisa de um projeto novo na Vercel (sugestão: `biosite-10-barbearia`, Root
Directory `modelos/10-barbearia`). Depois de criado, publique com `node scripts/publicar.mjs biosite-10-barbearia`
na raiz do repositório.
