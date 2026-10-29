# Sistema de Hospedagem · reserva direta

Site + sistema de reservas para quem aluga casas por temporada, **sem taxa de plataforma**.
Evolução do [Modelo 07 · Hospedagem](../../modelos/07-hospedagem) (que é só a vitrine estática).
Uma cópia por cliente: cada anfitrião tem o próprio projeto na Vercel e o próprio banco no Supabase.

**Stack:** Next.js 15 (App Router) · Supabase (Postgres, login e fotos) · Vercel.

## O que faz

**Site do hóspede (`/`)**
- Casas com galeria, comodidades e valores; pacotes de datas especiais; depoimentos e perguntas frequentes.
- Agenda com a disponibilidade real e o preço de cada noite (fim de semana, promoções e pacotes).
- Reserva fechada no próprio site: datas → dados do hóspede → aceite das condições → reserva criada.
  As datas ficam bloqueadas na hora, aguardando o sinal.
- Página da reserva (`/reserva/CODIGO`) com status, **QR Code Pix com o valor do sinal**, Pix copia e cola,
  prazo de pagamento e botão para enviar o comprovante no WhatsApp. O WhatsApp fica só para dúvidas.

**Painel do anfitrião (`/admin`)**
- **Visão geral:** reservas aguardando Pix, confirmadas no mês, ocupação dos próximos 30 dias, próximas chegadas.
- **Reservas:** confirmar o Pix, cancelar, reativar e chamar o hóspede no WhatsApp com mensagem pronta.
- **Agenda:** calendário por casa com hóspedes, preços e pacotes; bloqueio manual de datas
  (reserva feita no Airbnb, manutenção, uso próprio).
- **Casas:** criar e editar casas, enviar fotos (reduzidas no navegador antes do envio), definir capa e ordem, ocultar.
- **Promoções:** desconto em % ou diária fixa por período, para uma casa ou para todas.
- **Pacotes:** valor fechado por período; essas noites só saem pelo pacote.
- **Configurações:** nome, cores, textos do topo, Pix, sinal, prazo, condições, contatos, vantagens,
  depoimentos e perguntas.

**Regras que ficam no banco** (não dá para burlar pelo navegador): o preço da reserva é calculado
pelo servidor, duas pessoas não conseguem reservar as mesmas noites ao mesmo tempo, reservas sem
pagamento expiram sozinhas e os dados dos hóspedes só aparecem para o anfitrião logado.

## Colocar um cliente no ar

1. **Supabase:** crie um projeto em [supabase.com](https://supabase.com) (plano grátis).
2. **Banco:** em *SQL Editor*, cole e rode [`supabase/schema.sql`](supabase/schema.sql).
   Para começar com os dados de demonstração, rode também [`supabase/seed.sql`](supabase/seed.sql).
3. **Login do anfitrião:** em *Authentication → Users → Add user*, crie o e-mail e a senha do cliente.
   Em *Authentication → Sign In / Providers*, desligue **Allow new users to sign up**.
   Depois, no *SQL Editor*:
   ```sql
   insert into public.admins (email) values ('email-do-cliente@exemplo.com');
   ```
4. **Vercel:** crie o projeto com o *Root Directory* `sistemas/hospedagem` e as variáveis
   `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (em *Project Settings → API* do Supabase).
5. **Painel:** acesse `/admin`, entre com o login do cliente e preencha **Configurações**
   (Pix, WhatsApp, textos e cores). Depois, cadastre as casas.
6. **Domínio:** em *Settings → Domains* na Vercel.

## Rodar localmente

```bash
cp .env.example .env.local   # preencha com os dados do Supabase
npm install
npm run dev                  # http://localhost:3000 e http://localhost:3000/admin
```

## Testes

| Comando | O que verifica |
| --- | --- |
| `npm run test:db` | 36 verificações do banco: preços, conflitos, pacotes, promoções, expiração e permissões (anônimo, anfitrião, intruso) |
| `npm run test:race` | Duas reservas simultâneas das mesmas noites: só uma é gravada |
| `npm run dev:local` + `npm run test:e2e` | Fluxo completo no navegador: hóspede reserva, anfitrião configura o Pix, confirma, cria casa com foto, promoção, pacote e bloqueio, e o site reflete tudo |

Os testes de banco precisam do PostgreSQL 16 instalado (`initdb`/`pg_ctl`). Os de navegador precisam do Playwright.
`npm run dev:local` sobe um Postgres e uma **imitação** da API do Supabase ([`tests/dev-supabase.mjs`](tests/dev-supabase.mjs)),
que roda com as mesmas regras de segurança do schema. Ela serve para testar sem internet e
**não substitui** um teste final no Supabase de verdade.

## Próximos passos

- Pix automático (Mercado Pago ou Asaas), para a reserva confirmar sozinha quando o sinal cair.
- Sincronizar a agenda com o Airbnb e o Booking pelo link iCal de cada anúncio.
- E-mail automático para o hóspede quando a reserva for criada e confirmada.
