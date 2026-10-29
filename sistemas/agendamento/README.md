# Sistema de Agendamento (studios de beleza)

Agenda própria para os bio sites com agendamento online: a cliente escolhe serviço, dia e horário
livre no site, o horário fica segurado enquanto ela paga o sinal pelo Pix, e a dona do studio
gerencia tudo num painel no celular. Substitui o Google Agenda.

**Um banco para todos os studios.** Cada studio é uma conta dentro do mesmo Supabase. Cliente nova
= cadastrar o studio e o login dela (alguns minutos), sem criar outro banco nem outro painel.

**Stack:** Supabase (Postgres + login) · Next.js 15 (painel) · Vercel. Começa no plano grátis dos dois.

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

## Instalar (uma vez só)

1. **Supabase:** crie um projeto em [supabase.com](https://supabase.com) (plano grátis), região São Paulo.
2. **Banco:** em *SQL Editor*, cole e rode [`supabase/schema.sql`](supabase/schema.sql).
   Opcional: rode [`supabase/seed.sql`](supabase/seed.sql) para o studio de demonstração (fictício).
3. **Login da agência:** em *Authentication → Users → Add user*, crie o seu e-mail e senha. Em
   *Authentication → Sign In / Providers*, desligue **Allow new users to sign up**. No *SQL Editor*:
   ```sql
   insert into agency_admins (email) values ('seu-email@exemplo.com');
   ```
4. **Painel na Vercel:** projeto com *Root Directory* `sistemas/agendamento` e as variáveis
   `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (*Project Settings → API* do Supabase).
   Publique com `node scripts/publicar.mjs <projeto>` (a publicação é manual; ver README da raiz).
5. **Segredos do GitHub** (*Settings → Secrets and variables → Actions*):
   `AGENDA_SUPABASE_URL`, `AGENDA_SUPABASE_ANON_KEY` (despertador), `AGENDA_DB_URL` (Supabase →
   *Connect* → *Session pooler*, com a senha do banco) e `AGENDA_BACKUP_SENHA` (senha longa, guarde-a).
   Rode cada workflow uma vez em *Actions → Run workflow* para conferir.

## Cliente nova (alguns minutos)

1. Em *Authentication → Users → Add user*, crie o login da dona.
2. No *SQL Editor* (troque os valores):
   ```sql
   with s as (
     insert into studios (slug, name, whatsapp, settings) values (
       'nome-do-studio', 'Nome do Studio', '5571999999999',
       '{"step": 30, "minNotice": 120, "daysAhead": 30, "bufferMinutes": 0, "depositPercent": 30, "holdMinutes": 120,
         "pix": {"key": "+5571999999999", "keyLabel": "Celular", "keyDisplay": "(71) 99999-9999", "holder": "Nome do Titular", "city": "Salvador"}}'
     ) returning id
   ), m as (insert into studio_members (studio_id, email) select id, 'dona@exemplo.com' from s)
   insert into hours (studio_id, weekday, starts, ends)
   select s.id, d, f.ini, f.fim from s, generate_series(1, 6) d,
     (values ('09:00'::time, '12:00'::time), ('13:00'::time, '19:00'::time)) f (ini, fim);
   ```
3. Cadastre os serviços (em *Table Editor → services* ou por SQL: nome, categoria, minutos e valor).
4. No bio site da cliente, ligue a página de agendamento ao sistema (etapa 2, abaixo).

`settings`: `step` minutos entre horários · `minNotice` antecedência mínima (min) · `daysAhead` até
quantos dias à frente · `bufferMinutes` intervalo depois de cada atendimento · `depositPercent` sinal
(0 = confirma direto, sem sinal) · `holdMinutes` quanto tempo o horário fica segurado esperando o Pix.

## Rodar e testar

```bash
npm install
npm run test:db     # 41 verificações das regras do banco (Postgres dentro do Node, sem instalar nada)
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
