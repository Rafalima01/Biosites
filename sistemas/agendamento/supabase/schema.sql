-- =============================================================================
-- Sistema de Agendamento · banco de dados (Supabase / Postgres)
--
-- UM banco para TODOS os studios: cada studio é uma conta. Cliente nova = cadastrar
-- o studio, os serviços, os horários e o login da dona (sem criar outro Supabase).
--
-- Como instalar: no painel do Supabase, abra SQL Editor, cole este arquivo inteiro
-- e clique em Run. Pode rodar de novo sem perder dados ("if not exists"/"or replace").
--
-- Regras que ficam AQUI, no banco (não dá para burlar pelo navegador):
--   * horários livres calculados pelo expediente, duração do serviço, bloqueios e agendamentos;
--   * duas pessoas não conseguem marcar o mesmo horário ao mesmo tempo;
--   * valor e sinal vêm do cadastro do serviço (a cliente não consegue alterar);
--   * cada dona só enxerga os dados do próprio studio.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Agência (acesso a todos os studios) e studios
-- ---------------------------------------------------------------------------
create table if not exists public.agency_admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (length(name) between 2 and 80),
  timezone text not null default 'America/Sao_Paulo',
  whatsapp text not null default '',
  -- step (min entre horários), minNotice (min de antecedência), daysAhead, bufferMinutes
  -- (intervalo depois de cada atendimento), depositPercent, holdMinutes (quanto tempo o horário
  -- fica segurado esperando o sinal) e pix { key, keyLabel, keyDisplay, holder, city }.
  settings jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Quem entra no painel de cada studio (e-mail cadastrado em Authentication > Users).
create table if not exists public.studio_members (
  studio_id uuid not null references public.studios (id) on delete cascade,
  email text not null check (email = lower(email)),
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (studio_id, email)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  category text not null default '',
  name text not null check (length(name) between 2 and 120),
  description text not null default '',
  minutes int not null check (minutes between 5 and 600),
  price numeric(10, 2) not null check (price >= 0),
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists services_studio_idx on public.services (studio_id, sort);

-- Expediente: várias faixas por dia (ex.: 09:00–12:00 e 13:00–19:00). weekday 0 = domingo.
create table if not exists public.hours (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  starts time not null,
  ends time not null,
  check (ends > starts)
);
create index if not exists hours_studio_idx on public.hours (studio_id, weekday);

-- Bloqueios (folga, compromisso, almoço fora do padrão...).
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '',
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists blocks_studio_idx on public.blocks (studio_id, starts_at);

-- Agendamentos
--   pending   = aguardando o sinal (segura o horário até expires_at)
--   confirmed = sinal recebido / horário confirmado
--   done      = atendimento realizado
--   no_show   = cliente faltou
--   cancelled = cancelado
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  studio_id uuid not null references public.studios (id) on delete restrict,
  service_id uuid references public.services (id) on delete set null,
  service_name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  client_name text not null,
  client_phone text not null,
  notes text not null default '',
  price numeric(10, 2) not null,
  deposit numeric(10, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'done', 'no_show', 'cancelled')),
  source text not null default 'site' check (source in ('site', 'painel')),
  expires_at timestamptz,
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  check (ends_at > starts_at)
);
create index if not exists appointments_studio_idx on public.appointments (studio_id, starts_at);
create index if not exists appointments_status_idx on public.appointments (studio_id, status, created_at desc);

-- Clientes de cada studio, identificadas pelo WhatsApp (só dígitos, com DDD, sem o 55).
-- A cliente que volta é reconhecida pelo número e não precisa digitar o nome de novo.
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  phone text not null check (phone ~ '^\d{10,11}$'),
  name text not null check (length(name) between 2 and 120),
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (studio_id, phone)
);
alter table public.appointments add column if not exists client_id uuid references public.clients (id) on delete set null;
create index if not exists appointments_client_idx on public.appointments (client_id, starts_at desc);

-- "(71) 99999-0001", "5571999990001" → "71999990001" (ou null se não for um celular/fixo válido).
create or replace function public.norm_phone(p text)
returns text
language sql immutable
as $$
  select case
    when d ~ '^55\d{10,11}$' then substr(d, 3)
    when d ~ '^\d{10,11}$' then d
  end
  from (select regexp_replace(coalesce(p, ''), '\D', '', 'g') as d) x
$$;

-- Agendamentos antigos (de antes do cadastro) viram clientes.
insert into public.clients (studio_id, phone, name)
select distinct on (studio_id, norm_phone(client_phone)) studio_id, norm_phone(client_phone), client_name
from public.appointments
where norm_phone(client_phone) is not null and length(client_name) >= 2
order by studio_id, norm_phone(client_phone), created_at desc
on conflict (studio_id, phone) do nothing;
update public.appointments a set client_id = c.id
from public.clients c
where a.client_id is null and c.studio_id = a.studio_id and c.phone = norm_phone(a.client_phone);

-- =============================================================================
-- Acesso
-- =============================================================================
create or replace function public.jwt_email()
returns text
language sql stable
as $$ select lower(coalesce(auth.jwt() ->> 'email', '')) $$;

create or replace function public.is_agency()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from agency_admins where email = jwt_email()) $$;

create or replace function public.is_member(p_studio uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select is_agency() or exists (select 1 from studio_members where studio_id = p_studio and email = jwt_email())
$$;

-- Configuração numérica do studio com valor padrão.
create or replace function public.setting_int(p_settings jsonb, p_key text, p_default int)
returns int
language sql immutable
as $$ select coalesce((p_settings ->> p_key)::int, p_default) $$;

-- =============================================================================
-- Horários
-- =============================================================================

-- O período [p_from, p_to) já está ocupado? (agendamento ativo ou bloqueio)
create or replace function public.period_busy(p_studio uuid, p_from timestamptz, p_to timestamptz, p_ignore uuid default null)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from appointments a
    where a.studio_id = p_studio and a.id is distinct from p_ignore
      and tstzrange(a.starts_at, a.ends_at) && tstzrange(p_from, p_to)
      and (a.status in ('confirmed', 'done') or (a.status = 'pending' and a.expires_at > now()))
  ) or exists (
    select 1 from blocks k
    where k.studio_id = p_studio and tstzrange(k.starts_at, k.ends_at) && tstzrange(p_from, p_to)
  )
$$;

-- Horários de um dia para um serviço. Os ocupados continuam na lista com free = false
-- (o site mostra riscados). Fora da janela de agendamento, não devolve nada.
create or replace function public.day_slots(p_slug text, p_service uuid, p_day date)
returns table (slot text, starts_at timestamptz, free boolean)
language plpgsql stable security definer set search_path = public
as $$
declare
  st studios;
  sv services;
  step int;
  notice int;
  ahead int;
  buf int;
  today date;
  h record;
  m int;
  em int;
  t timestamptz;
begin
  select * into st from studios s where s.slug = p_slug and s.active;
  if st.id is null then return; end if;
  select * into sv from services x where x.id = p_service and x.studio_id = st.id and x.active;
  if sv.id is null then return; end if;

  step := greatest(5, setting_int(st.settings, 'step', 30));
  notice := setting_int(st.settings, 'minNotice', 120);
  ahead := setting_int(st.settings, 'daysAhead', 30);
  buf := setting_int(st.settings, 'bufferMinutes', 0);
  today := (now() at time zone st.timezone)::date;
  if p_day < today or p_day > today + ahead then return; end if;

  for h in select * from hours where studio_id = st.id and weekday = extract(dow from p_day)::int order by starts loop
    m := extract(hour from h.starts)::int * 60 + extract(minute from h.starts)::int;
    em := extract(hour from h.ends)::int * 60 + extract(minute from h.ends)::int;
    while m + sv.minutes <= em loop
      t := (p_day + make_interval(mins => m)) at time zone st.timezone;
      slot := to_char(make_time(m / 60, m % 60, 0), 'HH24:MI');
      starts_at := t;
      free := t >= now() + make_interval(mins => notice)
              and not period_busy(st.id, t, t + make_interval(mins => sv.minutes + buf));
      return next;
      m := m + step;
    end loop;
  end loop;
end;
$$;

-- Resumo de vários dias (para o calendário: quantos horários livres em cada dia).
create or replace function public.days_summary(p_slug text, p_service uuid, p_from date, p_to date)
returns table (day date, free_slots int)
language sql stable security definer set search_path = public
as $$
  select d::date, (select count(*)::int from day_slots(p_slug, p_service, d::date) s where s.free)
  from generate_series(p_from, least(p_to, p_from + 62), interval '1 day') d
$$;

-- Dados públicos do studio para o site (sem e-mails, sem agendamentos).
create or replace function public.public_studio(p_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'name', s.name,
    'slug', s.slug,
    'timezone', s.timezone,
    'whatsapp', s.whatsapp,
    'depositPercent', coalesce((s.settings ->> 'depositPercent')::numeric, 30),
    'holdMinutes', setting_int(s.settings, 'holdMinutes', 120),
    'daysAhead', setting_int(s.settings, 'daysAhead', 30),
    'pix', coalesce(s.settings -> 'pix', '{}'::jsonb),
    'services', coalesce((
      select jsonb_agg(jsonb_build_object('id', v.id, 'category', v.category, 'name', v.name, 'description', v.description,
                                          'minutes', v.minutes, 'price', v.price) order by v.sort, v.name)
      from services v where v.studio_id = s.id and v.active
    ), '[]'::jsonb)
  )
  from studios s where s.slug = p_slug and s.active
$$;

-- =============================================================================
-- Agendar
-- =============================================================================

create or replace function public.new_code()
returns text
language plpgsql volatile
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := '';
    for i in 1..7 loop
      c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from appointments where code = c);
  end loop;
  return c;
end;
$$;

-- O site pergunta primeiro o WhatsApp: se a cliente já tem cadastro no studio, é reconhecida
-- (devolve só o primeiro nome, para não expor dados de quem digitar um número qualquer).
create or replace function public.find_client(p_slug text, p_phone text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select case
    when norm_phone(p_phone) is null then jsonb_build_object('ok', false, 'reason', 'Informe um WhatsApp válido com DDD.')
    else jsonb_build_object('ok', true, 'found', c.id is not null, 'firstName', split_part(c.name, ' ', 1))
  end
  from (select 1) x
  left join studios s on s.slug = p_slug and s.active
  left join clients c on c.studio_id = s.id and c.phone = norm_phone(p_phone)
$$;

-- Aniversário da cliente (dia e mês, sem ano): para mensagens e promoções no aniversário.
alter table public.clients add column if not exists birth_day smallint;
alter table public.clients add column if not exists birth_month smallint;
alter table public.clients drop constraint if exists clients_aniversario_check;
alter table public.clients add constraint clients_aniversario_check check (
  (birth_day is null and birth_month is null)
  or (birth_month between 1 and 12 and birth_day between 1 and
      extract(day from make_date(2000, birth_month, 1) + interval '1 month - 1 day')::int)
);

-- Agendamento feito pela cliente no site (único jeito do público gravar).
-- Cliente já cadastrada: o nome vem do cadastro (p_name é ignorado). Cliente nova: nome obrigatório
-- e ela fica cadastrada no studio, com o aniversário quando informado (dia e mês).
drop function if exists public.book(text, uuid, timestamptz, text, text, text);
create or replace function public.book(p_slug text, p_service uuid, p_starts timestamptz, p_name text, p_phone text, p_notes text default '',
                                       p_birth_day int default null, p_birth_month int default null)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  st studios;
  sv services;
  cl clients;
  pct numeric;
  hold int;
  fone text := norm_phone(p_phone);
  a appointments;
begin
  -- Trava o studio: agendamentos simultâneos do mesmo studio entram um de cada vez.
  select * into st from studios where slug = p_slug and active for update;
  if st.id is null then return jsonb_build_object('ok', false, 'reason', 'Studio não encontrado.'); end if;
  select * into sv from services where id = p_service and studio_id = st.id and active;
  if sv.id is null then return jsonb_build_object('ok', false, 'reason', 'Serviço indisponível.'); end if;

  if fone is null then
    return jsonb_build_object('ok', false, 'reason', 'Informe um WhatsApp válido com DDD.');
  end if;
  select * into cl from clients where studio_id = st.id and phone = fone;
  if cl.id is null and trim(coalesce(p_name, '')) !~ '^\S{2,}(\s+\S+)+$' then
    return jsonb_build_object('ok', false, 'reason', 'Informe seu nome e sobrenome.', 'needName', true);
  end if;
  if cl.id is null and p_birth_month is not null and (
    p_birth_month not between 1 and 12 or p_birth_day is null or p_birth_day < 1
    or p_birth_day > extract(day from make_date(2000, p_birth_month, 1) + interval '1 month - 1 day')::int
  ) then
    return jsonb_build_object('ok', false, 'reason', 'Confira a data do seu aniversário.');
  end if;
  -- Evita abuso: no máximo 2 horários aguardando sinal por telefone.
  if (select count(*) from appointments
      where studio_id = st.id and norm_phone(client_phone) = fone
        and status = 'pending' and expires_at > now()) >= 2 then
    return jsonb_build_object('ok', false, 'reason', 'Você já tem horários aguardando o sinal. Fale com o studio pelo WhatsApp.');
  end if;

  if not exists (
    select 1 from day_slots(p_slug, p_service, (p_starts at time zone st.timezone)::date) s
    where s.starts_at = p_starts and s.free
  ) then
    return jsonb_build_object('ok', false, 'reason', 'Esse horário acabou de ser ocupado. Escolha outro.');
  end if;

  pct := coalesce((st.settings ->> 'depositPercent')::numeric, 30);
  hold := setting_int(st.settings, 'holdMinutes', 120);

  if cl.id is null then
    insert into clients (studio_id, phone, name, birth_day, birth_month)
    values (st.id, fone, regexp_replace(trim(p_name), '\s+', ' ', 'g'),
            case when p_birth_month is not null then p_birth_day end, p_birth_month)
    returning * into cl;
  end if;

  insert into appointments (code, studio_id, service_id, service_name, starts_at, ends_at, client_id, client_name, client_phone,
                            notes, price, deposit, status, source, expires_at)
  values (new_code(), st.id, sv.id, sv.name, p_starts, p_starts + make_interval(mins => sv.minutes),
          cl.id, cl.name, fone, left(coalesce(p_notes, ''), 500), sv.price,
          round(sv.price * pct / 100, 2), case when pct > 0 then 'pending' else 'confirmed' end, 'site',
          case when pct > 0 then now() + make_interval(mins => hold) end)
  returning * into a;

  return jsonb_build_object('ok', true, 'code', a.code, 'status', a.status, 'price', a.price, 'deposit', a.deposit,
                            'expiresAt', a.expires_at, 'startsAt', a.starts_at, 'service', a.service_name,
                            'firstName', split_part(cl.name, ' ', 1));
end;
$$;

-- Consulta pública de um agendamento pelo código (sem telefone).
create or replace function public.get_appointment(p_code text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'code', a.code,
    'status', case when a.status = 'pending' and a.expires_at <= now() then 'expired' else a.status end,
    'studio', s.name,
    'service', a.service_name,
    'startsAt', a.starts_at,
    'endsAt', a.ends_at,
    'clientName', split_part(a.client_name, ' ', 1),
    'price', a.price,
    'deposit', a.deposit,
    'expiresAt', a.expires_at
  )
  from appointments a join studios s on s.id = a.studio_id
  where a.code = upper(trim(p_code))
$$;

-- =============================================================================
-- Painel (só para quem é do studio)
-- =============================================================================

-- Muda o status. Voltar um cancelado/expirado para ativo só se o horário continuar livre.
create or replace function public.set_appointment_status(p_id uuid, p_status text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  a appointments;
begin
  select * into a from appointments where id = p_id for update;
  if a.id is null or not is_member(a.studio_id) then raise exception 'Acesso negado' using errcode = '42501'; end if;
  if p_status not in ('pending', 'confirmed', 'done', 'no_show', 'cancelled') then raise exception 'Status inválido'; end if;
  if p_status in ('pending', 'confirmed') and (a.status = 'cancelled' or (a.status = 'pending' and a.expires_at <= now())) then
    perform 1 from studios where id = a.studio_id for update;
    if period_busy(a.studio_id, a.starts_at, a.ends_at, a.id) then
      raise exception 'Esse horário já foi ocupado por outro agendamento.';
    end if;
  end if;
  update appointments set
    status = p_status,
    confirmed_at = case when p_status = 'confirmed' then now() else confirmed_at end,
    cancelled_at = case when p_status = 'cancelled' then now() else null end,
    expires_at = case when p_status = 'pending' then now() + interval '24 hours' else expires_at end
  where id = p_id;
end;
$$;

-- Encaixe feito pela dona (ex.: combinado pelo WhatsApp). Pode ser fora do expediente,
-- mas não pode bater com outro agendamento ou bloqueio.
create or replace function public.add_appointment(
  p_studio uuid, p_service uuid, p_starts timestamptz, p_name text, p_phone text default '', p_notes text default '',
  p_minutes int default null, p_price numeric default null
)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  sv services;
  cl clients;
  dur int;
  fone text := norm_phone(p_phone);
  nome text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
  a appointments;
begin
  if not is_member(p_studio) then raise exception 'Acesso negado' using errcode = '42501'; end if;
  perform 1 from studios where id = p_studio for update;
  select * into sv from services where id = p_service and studio_id = p_studio;
  if sv.id is null then return jsonb_build_object('ok', false, 'reason', 'Escolha um serviço.'); end if;
  -- Com WhatsApp, liga à cliente cadastrada (ou cadastra); o nome pode ficar em branco se ela já existe.
  if fone is not null then
    select * into cl from clients where studio_id = p_studio and phone = fone;
    if cl.id is null and length(nome) >= 2 then
      insert into clients (studio_id, phone, name) values (p_studio, fone, nome) returning * into cl;
    end if;
    if cl.id is not null and length(nome) < 2 then nome := cl.name; end if;
  end if;
  if length(nome) < 2 then return jsonb_build_object('ok', false, 'reason', 'Informe o nome da cliente.'); end if;
  dur := coalesce(p_minutes, sv.minutes);
  if period_busy(p_studio, p_starts, p_starts + make_interval(mins => dur)) then
    return jsonb_build_object('ok', false, 'reason', 'Já existe agendamento ou bloqueio nesse horário.');
  end if;
  insert into appointments (code, studio_id, service_id, service_name, starts_at, ends_at, client_id, client_name, client_phone,
                            notes, price, deposit, status, source, confirmed_at)
  values (new_code(), p_studio, sv.id, sv.name, p_starts, p_starts + make_interval(mins => dur), cl.id, nome,
          coalesce(fone, trim(coalesce(p_phone, ''))), left(coalesce(p_notes, ''), 500), coalesce(p_price, sv.price), 0,
          'confirmed', 'painel', now())
  returning * into a;
  return jsonb_build_object('ok', true, 'id', a.id, 'code', a.code);
end;
$$;

-- Chamada leve usada pelo "despertador" diário (evita a pausa do plano grátis do Supabase).
create or replace function public.ping()
returns text
language sql stable security definer set search_path = public
as $$ select 'ok:' || (select count(*) from studios)::text $$;

-- =============================================================================
-- Segurança (Row Level Security)
-- =============================================================================
alter table public.agency_admins enable row level security;
alter table public.studios enable row level security;
alter table public.studio_members enable row level security;
alter table public.services enable row level security;
alter table public.hours enable row level security;
alter table public.blocks enable row level security;
alter table public.appointments enable row level security;
alter table public.clients enable row level security;

drop policy if exists "agencia" on public.agency_admins;
create policy "agencia" on public.agency_admins for all to authenticated using (is_agency()) with check (is_agency());

drop policy if exists "leitura publica" on public.studios;
create policy "leitura publica" on public.studios for select using (active or is_member(id));
drop policy if exists "membro altera" on public.studios;
create policy "membro altera" on public.studios for update to authenticated using (is_member(id)) with check (is_member(id));
drop policy if exists "agencia cria" on public.studios;
create policy "agencia cria" on public.studios for insert to authenticated with check (is_agency());
drop policy if exists "agencia apaga" on public.studios;
create policy "agencia apaga" on public.studios for delete to authenticated using (is_agency());

drop policy if exists "ver os meus" on public.studio_members;
create policy "ver os meus" on public.studio_members for select to authenticated using (email = jwt_email() or is_agency());
drop policy if exists "agencia gerencia" on public.studio_members;
create policy "agencia gerencia" on public.studio_members for all to authenticated using (is_agency()) with check (is_agency());

do $$
declare t text;
begin
  -- Tabelas do studio: a dona (ou a agência) pode tudo no próprio studio.
  for t in select unnest(array['services', 'hours', 'blocks', 'appointments', 'clients']) loop
    execute format('drop policy if exists "membro total" on public.%I', t);
    execute format('create policy "membro total" on public.%I for all to authenticated using (public.is_member(studio_id)) with check (public.is_member(studio_id))', t);
  end loop;
end $$;

drop policy if exists "leitura publica" on public.services;
create policy "leitura publica" on public.services for select
  using (active and exists (select 1 from public.studios s where s.id = studio_id and s.active));
drop policy if exists "leitura publica" on public.hours;
create policy "leitura publica" on public.hours for select
  using (exists (select 1 from public.studios s where s.id = studio_id and s.active));
-- blocks, appointments e clients: sem leitura pública (o site usa day_slots e find_client, sem dados pessoais).

revoke all on function public.set_appointment_status(uuid, text) from public, anon;
revoke all on function public.add_appointment(uuid, uuid, timestamptz, text, text, text, int, numeric) from public, anon;
grant execute on function public.public_studio(text) to anon, authenticated;
grant execute on function public.day_slots(text, uuid, date) to anon, authenticated;
grant execute on function public.days_summary(text, uuid, date, date) to anon, authenticated;
grant execute on function public.book(text, uuid, timestamptz, text, text, text, int, int) to anon, authenticated;
grant execute on function public.get_appointment(text) to anon, authenticated;
grant execute on function public.find_client(text, text) to anon, authenticated;
grant execute on function public.ping() to anon, authenticated;
grant execute on function public.set_appointment_status(uuid, text) to authenticated;
grant execute on function public.add_appointment(uuid, uuid, timestamptz, text, text, text, int, numeric) to authenticated;

-- =============================================================================
-- Avisos no celular (Web Push)
--
-- O painel instalado na tela inicial registra o celular em push_subscriptions. O banco avisa:
--   * na hora em que um agendamento chega pelo site (gatilho em appointments);
--   * ~30 minutos antes de cada atendimento confirmado (send_reminders, a cada 5 minutos pelo pg_cron).
-- Quem entrega é a rota /api/push do painel (chaves VAPID ficam só na Vercel). O banco chama essa
-- rota pelo pg_net com um segredo guardado em app_config (tabela sem acesso pelo site).
-- Sem app_config preenchida, nada é enviado e nada quebra.
-- =============================================================================
alter table public.appointments add column if not exists reminded_at timestamptz;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  email text not null default '',
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_studio_idx on public.push_subscriptions (studio_id);

create table if not exists public.app_config (
  key text primary key,
  value text not null
);

alter table public.push_subscriptions enable row level security;
alter table public.app_config enable row level security; -- sem políticas: ninguém lê pelo site
drop policy if exists "membro total" on public.push_subscriptions;
create policy "membro total" on public.push_subscriptions for all to authenticated
  using (public.is_member(studio_id)) with check (public.is_member(studio_id));

-- Envia um aviso para todos os celulares do studio. Nunca impede a operação que chamou.
create or replace function public.push_send(p_studio uuid, p_title text, p_body text, p_url text default '/', p_tag text default null)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_url text := (select value from app_config where key = 'push_url');
  v_secret text := (select value from app_config where key = 'push_secret');
  subs jsonb;
begin
  if v_url is null or v_secret is null then return; end if;
  select jsonb_agg(jsonb_build_object('endpoint', endpoint, 'keys', jsonb_build_object('p256dh', p256dh, 'auth', auth)))
    into subs from push_subscriptions where studio_id = p_studio;
  if subs is null then return; end if;
  perform net.http_post(
    url := v_url,
    body := jsonb_build_object('subscriptions', subs, 'title', p_title, 'body', p_body, 'url', p_url, 'tag', p_tag),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', v_secret)
  );
exception when others then
  raise warning 'Aviso não enviado: %', sqlerrm;
end;
$$;

-- Agendamento novo pelo site → aviso imediato.
create or replace function public.on_new_appointment()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  tz text;
  quando text;
begin
  if new.source = 'site' then
    select timezone into tz from studios where id = new.studio_id;
    quando := to_char(new.starts_at at time zone tz, 'DD/MM') || ' às ' || to_char(new.starts_at at time zone tz, 'HH24:MI');
    perform push_send(
      new.studio_id,
      case when new.status = 'pending' then 'Novo agendamento · aguardando sinal' else 'Novo agendamento' end,
      split_part(new.client_name, ' ', 1) || ' · ' || new.service_name || ' · ' || quando,
      case when new.status = 'pending' then '/pedidos' else '/agenda?dia=' || to_char(new.starts_at at time zone tz, 'YYYY-MM-DD') end,
      'novo-' || new.code
    );
  end if;
  return new;
end;
$$;
drop trigger if exists appointments_push on public.appointments;
create trigger appointments_push after insert on public.appointments for each row execute function public.on_new_appointment();

-- Lembretes: atendimentos confirmados que começam nos próximos 30 minutos (uma vez cada).
create or replace function public.send_reminders()
returns int
language plpgsql volatile security definer set search_path = public
as $$
declare
  a record;
  n int := 0;
  faltam int;
begin
  for a in
    select ap.id, ap.studio_id, ap.code, ap.starts_at, ap.client_name, ap.service_name, s.timezone
    from appointments ap join studios s on s.id = ap.studio_id
    where ap.status = 'confirmed' and ap.reminded_at is null
      and ap.starts_at > now() and ap.starts_at <= now() + interval '30 minutes'
    for update of ap skip locked
  loop
    faltam := greatest(1, round(extract(epoch from a.starts_at - now()) / 60)::int);
    perform push_send(
      a.studio_id,
      'Daqui a ' || faltam || ' min: ' || split_part(a.client_name, ' ', 1) || ' às ' || to_char(a.starts_at at time zone a.timezone, 'HH24:MI'),
      a.client_name || ' · ' || a.service_name,
      '/agenda?dia=' || to_char(a.starts_at at time zone a.timezone, 'YYYY-MM-DD'),
      'lembrete-' || a.code
    );
    update appointments set reminded_at = now() where id = a.id;
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- A rota de envio avisa quais celulares não existem mais (app removido): saem da lista.
create or replace function public.push_remove(p_secret text, p_endpoints text[])
returns int
language plpgsql volatile security definer set search_path = public
as $$
declare n int;
begin
  if p_secret is null or p_secret <> coalesce((select value from app_config where key = 'push_secret'), '') then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;
  delete from push_subscriptions where endpoint = any (p_endpoints);
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.push_send(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.send_reminders() from public, anon, authenticated;
revoke all on function public.on_new_appointment() from public, anon, authenticated;
revoke all on function public.push_remove(text, text[]) from public;
grant execute on function public.push_remove(text, text[]) to anon, authenticated;

-- =============================================================================
-- Link do biosite (botão "Meu site" no painel) e convites de cadastro
-- =============================================================================
alter table public.studios add column if not exists site_url text not null default '';

-- Link único para a dona criar o próprio login: vale uma vez e por 7 dias. Só o servidor do
-- painel (chave service_role) lê e usa; pelo site e pelo login comum, a tabela não aparece.
create table if not exists public.invites (
  token text primary key,
  studio_id uuid not null references public.studios (id) on delete cascade,
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz,
  used_email text,
  created_at timestamptz not null default now()
);
alter table public.invites enable row level security; -- sem políticas

-- Rode no SQL Editor: select novo_convite('slug-do-studio'); devolve o link pronto para enviar.
create or replace function public.novo_convite(p_slug text)
returns text
language plpgsql volatile security definer set search_path = public
as $$
declare
  sid uuid;
  tk text := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
begin
  select id into sid from studios where slug = p_slug;
  if sid is null then raise exception 'Studio não encontrado: %', p_slug; end if;
  insert into invites (token, studio_id) values (tk, sid);
  return coalesce((select value from app_config where key = 'painel_url'), 'https://sistema-agendamento-sand.vercel.app')
    || '/convite/' || tk;
end;
$$;
revoke all on function public.novo_convite(text) from public, anon, authenticated;

-- =============================================================================
-- Financeiro: despesas do studio (material, aluguel, contas...). Só quem é do studio vê e anota.
-- =============================================================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  spent_on date not null,
  description text not null check (length(description) between 1 and 120),
  category text not null default 'Outros'
    check (category in ('Material', 'Aluguel', 'Contas', 'Marketing', 'Equipamentos', 'Taxas', 'Pessoal', 'Outros')),
  amount numeric(10, 2) not null check (amount > 0 and amount < 1000000),
  created_at timestamptz not null default now()
);
create index if not exists expenses_studio_idx on public.expenses (studio_id, spent_on);
alter table public.expenses enable row level security;
drop policy if exists "membro total" on public.expenses;
create policy "membro total" on public.expenses for all to authenticated
  using (public.is_member(studio_id)) with check (public.is_member(studio_id));

-- =============================================================================
-- Produtos e estoque do studio (gel, tips, esmaltes, descartáveis...). Só quem é do studio vê.
-- =============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  category text not null default '' check (length(category) <= 40),
  unit text not null default 'un',
  quantity numeric(10, 2) not null default 0 check (quantity >= 0),
  min_quantity numeric(10, 2) not null default 0 check (min_quantity >= 0),
  unit_cost numeric(10, 2) not null default 0 check (unit_cost >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_studio_idx on public.products (studio_id, name);
-- Controle por embalagem (unidade, caixa, pacote, par): acabou uma, dá baixa de uma. Sem ml/grama.
update public.products set unit = 'un' where unit not in ('un', 'cx', 'pct', 'par');
alter table public.products drop constraint if exists products_unit_check;
alter table public.products add constraint products_unit_check check (unit in ('un', 'cx', 'pct', 'par'));
-- Quantas unidades vêm em cada caixa ou pacote (opcional): mostra quanto sai cada unidade.
alter table public.products add column if not exists per_pack int check (per_pack is null or per_pack between 1 and 100000);
alter table public.products enable row level security;
drop policy if exists "membro total" on public.products;
create policy "membro total" on public.products for all to authenticated
  using (public.is_member(studio_id)) with check (public.is_member(studio_id));

-- Dar baixa ou somar no estoque (− / +). Roda com as permissões de quem chama: só o próprio studio.
create or replace function public.stock_adjust(p_id uuid, p_delta numeric)
returns numeric
language sql volatile security invoker set search_path = public
as $$
  update products set quantity = greatest(0, quantity + p_delta), updated_at = now()
  where id = p_id
  returning quantity
$$;

-- Repor: soma a quantidade, atualiza o custo por unidade e, se pedir, lança a compra nas despesas.
create or replace function public.stock_restock(p_id uuid, p_qty numeric, p_total numeric, p_expense boolean, p_day date)
returns numeric
language plpgsql volatile security invoker set search_path = public
as $$
declare p products;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'Informe a quantidade' using errcode = '22023'; end if;
  update products
  set quantity = quantity + p_qty,
      unit_cost = case when coalesce(p_total, 0) > 0 then round(p_total / p_qty, 2) else unit_cost end,
      updated_at = now()
  where id = p_id
  returning * into p;
  if p.id is null then raise exception 'Acesso negado' using errcode = '42501'; end if;
  if p_expense and coalesce(p_total, 0) > 0 then
    insert into expenses (studio_id, spent_on, description, category, amount)
    values (p.studio_id, coalesce(p_day, current_date), left('Reposição: ' || p.name, 120), 'Material', round(p_total, 2));
  end if;
  return p.quantity;
end;
$$;
revoke all on function public.stock_adjust(uuid, numeric) from public, anon;
revoke all on function public.stock_restock(uuid, numeric, numeric, boolean, date) from public, anon;
grant execute on function public.stock_adjust(uuid, numeric) to authenticated;
grant execute on function public.stock_restock(uuid, numeric, numeric, boolean, date) to authenticated;

-- =============================================================================
-- Primeiro acesso da agência (troque o e-mail e rode esta linha separadamente):
-- insert into public.agency_admins (email) values ('voce@exemplo.com') on conflict do nothing;
-- =============================================================================
