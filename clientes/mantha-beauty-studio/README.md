# Mantha Beauty Studio · Samantha Carvalho

Bio site oficial da cliente, copiado do **Modelo 09 · Delicado** ([`modelos/09-delicado`](../../modelos/09-delicado)) com a identidade dela (roxo ameixa, dourado e creme). Conteúdo em [`src/sites/mantha-beauty-studio/site.config.js`](src/sites/mantha-beauty-studio/site.config.js).

**Antes de usar o agendamento de verdade:** trocar a chave Pix provisória (`pix.key`) pela da Samantha e configurar `AGENDA_ICS_URL` no projeto `biosite-mantha-beauty-studio` da Vercel.

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
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `tokens.css`; a Mantha usa roxo ameixa, dourado e creme da identidade dela) |

Ações dos cards:

```js
{ type: 'channel', channel: 'whatsapp' | 'booking' | 'instagram' | 'location' | 'website', message?: '...' }
{ type: 'page', href: '/servicos/' }
{ type: 'section', target: 'sobre' | 'trabalhos' }
{ type: 'url', href: 'https://...', label: 'Nome do destino' }
```

**Destinos vazios** viram botões que avisam "destino ainda não configurado", em vez de links inventados.

## Agendamento online (`/agendar/`)

Sem banco de dados. Etapas: **serviço → data e horário livres → nome e WhatsApp → revisão → sinal**.

- **Horários livres:** gerados a partir de `booking` (dias, abertura, fechamento, intervalo entre horários,
  pausas, antecedência mínima e quantos dias à frente), respeitando a duração de cada serviço.
- **Horários ocupados:** a função `api/disponibilidade.js` (Vercel) lê a **agenda do Google** da profissional
  e devolve só os períodos ocupados, sem títulos nem nomes. Eventos repetidos, folgas de dia inteiro e
  exceções são considerados; eventos marcados como "Disponível" ou cancelados não bloqueiam.
  Mudanças na agenda aparecem no site em poucos minutos (o próprio Google leva alguns minutos para atualizar o link).
- **Sinal:** Pix copia e cola e QR Code gerados no próprio site (`src/lib/pix.js`) já com o valor de
  `booking.deposit` (30%), mais a política de `policy` com a caixa "Li e concordo" obrigatória.
- **Envio:** "Agendar e enviar comprovante" abre o WhatsApp com a mensagem pronta (serviço, data, horário,
  valor, sinal, nome e WhatsApp). A cliente anexa o comprovante; o horário vale quando a profissional confirma.

### Ligar a agenda do Google

1. No computador, abra o Google Agenda → **Configurações** → escolha a agenda → **Integrar agenda**.
2. Copie o **Endereço secreto no formato iCal** (termina em `basic.ics`). Não compartilhe esse link.
3. Na Vercel, no projeto `biosite-mantha-beauty-studio`: **Settings → Environment Variables** →
   `AGENDA_ICS_URL` = o endereço copiado (ambiente Production) e faça um novo deploy.

Sem `AGENDA_ICS_URL`, o calendário mostra todo o expediente (a confirmação continua pelo WhatsApp).
Para testar localmente: `AGENDA_ICS_URL=https://... npm run dev` (o `vite.config.js` responde `/api/disponibilidade`).

**Fase de teste:** a chave Pix em `pix.key` é provisória. Troque pela chave da cliente antes de usar de verdade.

## Textos a confirmar com a cliente

"Sobre mim", a frase do topo e as dúvidas frequentes foram escritos só com o que já está confirmado
(serviços, horário, Salvador). Formas de pagamento e outros detalhes ficaram de fora até a cliente informar.

## Publicar na Vercel

Projeto `biosite-mantha-beauty-studio` · Root Directory `clientes/mantha-beauty-studio` ·
Produção: https://biosite-mantha-beauty-studio.vercel.app

Enquanto a pasta não estiver na `main`, publique pela CLI a partir da raiz do repositório
(`vercel deploy --prod --cwd .` com o projeto acima).
