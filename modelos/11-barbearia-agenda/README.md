# Modelo 11 · Barbearia com agenda

O mesmo bio site do [Modelo 10 · Barbearia](../10-barbearia) (versão básica, só o bio site) com o
**agendamento online** do [Sistema de Agendamento](../../sistemas/agendamento) da Vertex. Vendemos os dois:
o 10 sozinho e este com a agenda. Demonstração: **Marcos Ferraz · Ferraz Barber Club**, Rio de Janeiro
(marca fictícia).

**O que muda em relação ao 10:** "Agende seu corte", a chamada final e cada serviço da página `/servicos/`
levam para a página **`/agendar/`** (o serviço tocado já chega escolhido), em vez de abrir o WhatsApp direto.
A agenda é a mesma do [Modelo 09](../09-delicado) (mesmas etapas e regras), vestida com a identidade da
barbearia: cartões grafite com borda laranja, botões em pílula laranja com texto escuro, títulos em Poppins
e detalhes em DM Serif e Great Vibes (`src/styles/components/booking.css`).

O resto (topo, cards com o calendário 3D e o selo da tesoura, sobre, cortes, espaço, rodapé) é igual ao 10;
veja o [README do 10](../10-barbearia/README.md) para a composição e as imagens 3D.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, as três páginas, links, regras da agenda e Pix
npm run build     # gera /dist (início, /servicos/ e /agendar/)
npm run preview   # serve o /dist localmente
```

## Personalizar

Tudo fica em `src/sites/marcos-ferraz/site.config.js` (mesmos campos do 10), mais:

| O quê | Onde |
| --- | --- |
| Ligação com o Sistema de Agendamento (url, chave pública e studio) | `sistema` |
| Expediente usado sem o sistema (dias, horários, pausas, antecedência, sinal) | `booking` |
| Pix do sinal (chave, titular, cidade) | `pix` |
| Política de agendamento e cancelamento | `policy` |
| Textos da página `/agendar/` | `pages.agendar` |

## Agendamento online (`/agendar/`)

Etapas: **serviço → data e horário livres → WhatsApp (cliente já cadastrado é reconhecido; cliente novo
digita nome e aniversário) → revisão → confirmar**.

**Sinal:** quem decide é o studio, no painel do sistema (**Configurações → Exigir sinal**); o site lê na hora.
- **Sem sinal** (padrão da barbearia de demonstração): a revisão já confirma o horário no sistema, sem Pix,
  e a etapa "Sinal" some da barra de etapas.
- **Com sinal**: aparece a etapa do Pix com a porcentagem do painel, QR Code e "copia e cola" gerados no
  próprio site e a política com "Li e concordo" obrigatório (igual ao Modelo 09).

### Com o Sistema de Agendamento (padrão da maquete)

Com `sistema` preenchido, os horários livres vêm do sistema (expediente, bloqueios e agendamentos do painel)
e o agendamento é **gravado**: sem sinal, já entra confirmado na agenda do painel; com sinal, entra em
"Aguardando sinal" e o site abre o WhatsApp com o código para mandar o comprovante.
Os serviços do site se ligam aos do sistema **pelo nome**; valor e duração passam a ser os do sistema.

A maquete usa o studio de demonstração **`ferraz-barber`**, instalado com
[`sistemas/agendamento/supabase/demo-barbearia.sql`](../../sistemas/agendamento/supabase/demo-barbearia.sql)
(14 serviços com os mesmos nomes do site; terça a sexta 9h às 20h e sábado 8h às 18h, com pausa das 12h às 13h;
sem sinal).
Enquanto ele não estiver no banco, a página mostra "Não foi possível carregar a agenda agora".

**Cliente real:** copie a pasta para `clientes/<cliente>`, cadastre o studio dele no banco (README do sistema)
com os serviços com os mesmos nomes do site e troque `sistema.studio` pelo slug dele.

### Sem o sistema (agenda do Google)

Apague o bloco `sistema`. Os horários saem de `booking` e os ocupados vêm da agenda do Google pela função
`api/disponibilidade.js` (variável `AGENDA_ICS_URL` na Vercel), igual ao Modelo 09.

**Fase de teste:** WhatsApp e chave Pix são fictícios (DDD 00). Troque pelos do cliente antes de usar.

## Publicar na Vercel

Ainda não publicado. Precisa de um projeto novo na Vercel (sugestão: `biosite-11-barbearia-agenda`, Root
Directory `modelos/11-barbearia-agenda`) e do studio `ferraz-barber` instalado no banco.
