# Sistema de Agendamento (studios de beleza)

Agenda própria para os bio sites com agendamento online: a cliente escolhe serviço, dia e horário
livre no site, o horário fica segurado enquanto ela paga o sinal pelo Pix, e a dona do studio
gerencia tudo num painel no celular. Substitui o Google Agenda.

**Um banco para todos os studios.** Cada studio é uma conta dentro do mesmo Supabase. Cliente nova
= cadastrar o studio e o login dela (alguns minutos), sem criar outro banco nem outro painel.

**Stack:** Supabase (Postgres + login) · Next.js 15 (painel) · Vercel. Começa no plano grátis dos dois.

**No ar:** painel em https://sistema-agendamento-sand.vercel.app (projeto Vercel `sistema-agendamento`) · banco Supabase `jbudmvywhaskaemicubn` (São Paulo). Studio cadastrado: Mantha Beauty Studio. A instalação real foi feita com `supabase/instalar-vertex.sql` (fica fora do git, tem dados de clientes).

## O que já está pronto (etapa 1)

**Banco** ([`supabase/schema.sql`](supabase/schema.sql)), com as regras no próprio banco:
- horários livres calculados pelo expediente (várias faixas por dia, ex.: 09–12 e 13–19), duração
  do serviço, antecedência mínima, janela de dias e intervalo entre atendimentos, no fuso do studio;
- duas clientes não conseguem o mesmo horário (o studio é travado durante cada agendamento);
- valor e sinal vêm do cadastro do serviço; sem pagamento no prazo, o horário volta a ficar livre;
- horários ocupados continuam aparecendo (o site mostra riscados);
- cada dona só enxerga o próprio studio; a agência (Vertex) enxerga todos.

**Funções que o site usa** (chave pública "anon", sem dados pessoais): `public_studio(slug)`,
`day_slots(slug, serviço, dia)`, `days_summary(slug, serviço, de, até)`, `book(...)` e
`get_appointment(código)`.

**Painel** (`app/`), feito para o celular:
- **Agenda** do dia (ir e voltar de dia), com totais, status de cada atendimento, botão do WhatsApp
  da cliente e ações: confirmar sinal, realizado, faltou, cancelar, reativar;
- **Encaixar atendimento** combinado pelo WhatsApp (entra confirmado e já ocupa o site);
- **Aguardando sinal**: o que está segurando horário e o que venceu nos últimos 2 dias;
- **Bloqueios**: folga, compromisso, dia inteiro ou vários dias.

**Plano grátis do Supabase** ([`.github/workflows`](../../.github/workflows)):
- **despertador diário** (`agenda-despertador.yml`) evita que o banco pause após 7 dias sem uso;
- **backup semanal criptografado** (`agenda-backup.yml`), porque o grátis não faz backup.
  O repositório é público, então o arquivo é cifrado com senha antes de ser guardado (30 dias).

## Avisos no celular (app instalado)

O painel é instalável (manifest + service worker). No iPhone: Safari → **Compartilhar → Adicionar à
Tela de Início** → abrir pelo ícone → **Ativar avisos** (a Apple só libera notificação com o app
instalado; iOS 16.4 ou mais novo). No Android/computador, o botão funciona direto no navegador.

- **Novo agendamento pelo site** → aviso na hora ("Novo agendamento · aguardando sinal"), abre
  "Aguardando sinal". Gatilho `appointments_push` no banco.
- **Lembrete** perto de 30 minutos antes de cada atendimento confirmado ("Daqui a 28 min: Ana às 13:00").
  `send_reminders()` roda a cada 5 minutos pelo `pg_cron`; cada atendimento é lembrado uma vez.
- Quem entrega é a rota `/api/push` (biblioteca `web-push`). O banco chama a rota pelo `pg_net` com
  o segredo de `app_config`; celulares que desinstalaram o app saem da lista sozinhos.

Variáveis do projeto Vercel: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_SECRET`
(gerados uma vez; trocar invalida os celulares já inscritos). Ativação no banco:
`supabase/instalar-avisos.sql` (fora do git: tem o segredo) liga `pg_net`/`pg_cron`, grava
`push_url`/`push_secret` em `app_config` e agenda `agenda-lembretes`.

## Instalar (uma vez só)

1. **Supabase:** crie um projeto em [supabase.com](https://supabase.com) (plano grátis), região São Paulo.
2. **Banco:** em *SQL Editor*, cole e rode [`supabase/schema.sql`](supabase/schema.sql).
   Opcional: rode [`supabase/seed.sql`](supabase/seed.sql) para o studio de demonstração (fictício).
   Para a maquete da barbearia (Modelo 11), rode [`supabase/demo-barbearia.sql`](supabase/demo-barbearia.sql) (studio `ferraz-barber`).
3. **Login da agência:** em *Authentication → Users → Add user*, crie o seu e-mail e senha. Em
   *Authentication → Sign In / Providers*, desligue **Allow new users to sign up**. No *SQL Editor*:
   ```sql
   insert into agency_admins (email) values ('seu-email@exemplo.com');
   ```
4. **Painel na Vercel:** projeto com *Root Directory* `sistemas/agendamento` e as variáveis
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`
   (*Project Settings → API Keys* do Supabase; a service_role fica só no servidor e serve para o
   cadastro pelo link de convite).
   Publique com `node scripts/publicar.mjs <projeto>` (a publicação é manual; ver README da raiz).
5. **Segredos do GitHub** (*Settings → Secrets and variables → Actions*):
   `AGENDA_SUPABASE_URL`, `AGENDA_SUPABASE_ANON_KEY` (despertador), `AGENDA_DB_URL` (Supabase →
   *Connect* → *Session pooler*, com a senha do banco) e `AGENDA_BACKUP_SENHA` (senha longa, guarde-a).
   Rode cada workflow uma vez em *Actions → Run workflow* para conferir.

## Cliente nova (alguns minutos)

1. No *SQL Editor* (troque os valores):
   ```sql
   with s as (
     insert into studios (slug, name, whatsapp, site_url, settings) values (
       'nome-do-studio', 'Nome do Studio', '5571999999999', 'https://biosite-nome-do-studio.vercel.app',
       '{"step": 30, "minNotice": 120, "daysAhead": 30, "bufferMinutes": 0, "depositPercent": 30, "holdMinutes": 120,
         "pix": {"key": "+5571999999999", "keyLabel": "Celular", "keyDisplay": "(71) 99999-9999", "holder": "Nome do Titular", "city": "Salvador"}}'
     ) returning id
   )
   insert into hours (studio_id, weekday, starts, ends)
   select s.id, d, f.ini, f.fim from s, generate_series(1, 6) d,
     (values ('09:00'::time, '12:00'::time), ('13:00'::time, '19:00'::time)) f (ini, fim);
   ```
2. Cadastre os serviços (em *Table Editor → services* ou por SQL: nome, categoria, minutos e valor).
3. **Login da dona:** rode `select novo_convite('nome-do-studio');` e mande o link que aparece. Ela
   escolhe e-mail e senha e já entra no painel; o link vale uma vez só, por 7 dias.
4. No bio site da cliente, ligue a página de agendamento ao sistema (etapa 2, abaixo).

`settings`: `step` minutos entre horários · `minNotice` antecedência mínima (min) · `daysAhead` até
quantos dias à frente · `bufferMinutes` intervalo depois de cada atendimento · `depositPercent` sinal
(0 = confirma direto, sem sinal) · `holdMinutes` quanto tempo o horário fica segurado esperando o Pix.

## Rodar e testar

```bash
npm install
npm run test:db     # 67 verificações das regras do banco (Postgres dentro do Node, sem instalar nada)
cp .env.example .env.local   # dados do Supabase
npm run dev         # painel em http://localhost:3000
```

O teste do banco cobre horários, fuso, almoço, janela de dias, conflito de horário, sinal e expiração,
bloqueios, encaixe, cancelamento e reativação, isolamento entre studios e permissões (visitante,
dona, dona de outro studio e agência). **Ainda não testado:** o painel com um Supabase de verdade
(depende de criar o projeto) e duas reservas exatamente simultâneas (o PGlite roda uma conexão só;
a trava usada é a mesma do sistema de hospedagem, que tem teste de concorrência).

## Próximas etapas

2. **Ligar o site da Samantha** (cópia do Modelo 09): a página `/agendar/` passa a ler os horários e
   gravar o agendamento por este sistema, no lugar do Google Agenda. Depois, levar para a maquete.
3. **Painel completo:** editar serviços, preços, expediente e configurações sem SQL; lista de clientes
   com histórico; remarcar.
4. **Automações:** Pix automático (Mercado Pago ou Asaas) e lembrete no WhatsApp na véspera.
