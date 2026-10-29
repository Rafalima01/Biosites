# Modelo 08 · Glam

Bio site com cara de app para **nail designers e studios de beleza**: cartões de vidro fosco sobre uma
foto de fundo, letreiro em neon e uma galeria de inspirações em que a cliente escolhe as referências
antes de agendar. Demonstração: **Rosé Nail Studio · Bia Lins** (marca fictícia).

**Composição:**
- **Cartão do studio:** foto com banho rosa, letreiro em neon (Poiret One) e botão de compartilhar.
  Abaixo, uma pílula rosa com o serviço em destaque, o status ("Agenda aberta") e a nail designer.
  Depois vêm as inspirações escolhidas, os dias e horários, o botão rosa "Agendar horário" e o aviso do sinal.
- **Cartão de inspirações:** filtros por categoria, perfil com "Seguir" (Instagram) e fotos com
  curtir (♥) e escolher (+).
- **Cartão de serviços:** valores e links (Instagram, localização, cursos).

No celular os cartões ficam empilhados; no desktop, lado a lado e desencontrados, como na referência.

**Inspirações → WhatsApp:** as fotos escolhidas no "+" aparecem no cartão de agendamento e entram na
mensagem do botão "Agendar horário" (ex.: *"Inspirações que escolhi no site: Nude amendoada, Chama
colorida."*). Curtidas e escolhas ficam salvas no navegador da cliente.

Mesma base técnica dos outros modelos: página pré-renderizada a partir da config, JavaScript mínimo.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, renderização e geração de links
npm run build     # gera /dist
```

## Personalizar

Tudo fica em `src/sites/rose-nail-studio/site.config.js`:

| O quê | Onde |
| --- | --- |
| Letreiro em neon, nome do studio, nail designer e foto dela | `brand` |
| Foto do studio e foto de fundo | `studio.photo` e `backdrop` |
| Serviço em destaque, status e foto | `featured` |
| Dias e horários | `schedule` |
| Texto do botão, aviso do sinal e mensagem do WhatsApp | `cta` |
| Categorias e fotos de inspiração | `inspo.tags` e `inspo.items` |
| Serviços e valores | `services` |
| Links do último cartão | `links` |
| WhatsApp, Instagram, endereço | `contact` |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `tokens.css`) |

Fotos da cliente: coloque em `public/media/` e informe `{ src: '/media/foto.webp', alt, width, height }`.

## Publicar na Vercel

Projeto `biosite-08-glam` · Root Directory `modelos/08-glam` (o `vercel.json` define build, saída e cabeçalhos).
