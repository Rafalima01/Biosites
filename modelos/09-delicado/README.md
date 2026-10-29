# Modelo 09 · Delicado

Bio site em rosa claro com assinatura manuscrita, feito a partir da referência em
[`docs/referencia.jpg`](docs/referencia.jpg). Teste com os dados reais da
**Mantha Beauty Studio · Samantha Carvalho** (mesmas informações do site dela no Modelo 08 · Glam).

**Composição:** foto no topo, nome em duas cores (primeiro nome em
itálico branco, sobrenome rosa) e especialidades; cartão branco com quatro cards (ícone em bloco rosa,
título em serifa, apoio e seta); frase em serifa + manuscrita; "Sobre mim" com a assinatura manuscrita
atrás do título e a foto se dissolvendo no fundo; "Como posso te ajudar" em três colunas; faixa rosa "Quero agendar"; fotos de trabalhos com
legenda; dúvidas frequentes que abrem e fecham; rodapé rosa com assinatura e canais.
Página `/servicos/` com as categorias em blocos que abrem e fecham e agendamento por serviço no WhatsApp.

No celular é uma coluna só. No desktop o início vira duas colunas, como na referência: o "celular"
(topo, cards e frase) à esquerda e as seções à direita.

Fontes: Playfair Display (títulos), Allura (manuscrita) e Montserrat (texto).

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, renderização das duas páginas e links
npm run build     # gera /dist (início e /servicos/)
npm run preview   # serve o /dist localmente
```

## Personalizar

Tudo fica em `src/sites/mantha-beauty-studio/site.config.js`:

| O quê | Onde |
| --- | --- |
| Nome, assinatura manuscrita e especialidades | `brand` |
| Foto do topo | `hero.photo` |
| Cards do topo (título, apoio, ícone, ação) | `menu` |
| Frase abaixo dos cards | `phrase` |
| Sobre mim (texto e foto) | `about` |
| Como posso te ajudar | `help` (ícones: `brow`, `lashes`, `lips`, `sparkle`…) |
| Faixa de agendamento | `cta` |
| Fotos de trabalhos | `gallery` |
| Dúvidas frequentes | `faq` |
| Serviços e página `/servicos/` | `services` e `pages.servicos` |
| WhatsApp, Instagram, mapa | `contact` e `social` (rodapé) |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `tokens.css`) |

Ações dos cards:

```js
{ type: 'channel', channel: 'whatsapp' | 'booking' | 'instagram' | 'location' | 'website', message?: '...' }
{ type: 'page', href: '/servicos/' }
{ type: 'section', target: 'sobre' | 'trabalhos' }
{ type: 'url', href: 'https://...', label: 'Nome do destino' }
```

**Destinos vazios** viram botões que avisam "destino ainda não configurado", em vez de links inventados.

## Textos a confirmar com a cliente

"Sobre mim", a frase do topo e as dúvidas frequentes foram escritos só com o que já está confirmado
(serviços, horário, Salvador). Formas de pagamento e outros detalhes ficaram de fora até a cliente informar.

## Publicar na Vercel

Projeto `biosite-09-delicado` · Root Directory `modelos/09-delicado` ·
Produção: https://biosite-09-delicado.vercel.app

Enquanto a pasta não estiver na `main`, publique pela CLI a partir da raiz do repositório
(`vercel deploy --prod --cwd .` com o projeto acima).
