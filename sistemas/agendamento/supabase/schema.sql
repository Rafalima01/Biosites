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

-- Agendamento feito pela cliente no site (único jeito do público gravar).
create or replace function public.book(p_slug text, p_service uuid, p_starts timestamptz, p_name text, p_phone text, p_notes text default '')
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  st studios;
  sv services;
  pct numeric;
  hold int;
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  a appointments;
begin
  -- Trava o studio: agendamentos simultâneos do mesmo studio entram um de cada vez.
  select * into st from studios where slug = p_slug and active for update;
  if st.id is null then return jsonb_build_object('ok', false, 'reason', 'Studio não encontrado.'); end if;
  select * into sv from services where id = p_service and studio_id = st.id and active;
  if sv.id is null then return jsonb_build_object('ok', false, 'reason', 'Serviço indisponível.'); end if;

  if trim(coalesce(p_name, '')) !~ '^\S{2,}(\s+\S+)+$' then
    return jsonb_build_object('ok', false, 'reason', 'Informe seu nome e sobrenome.');
  end if;
  if length(digits) < 10 or length(digits) > 13 then
    return jsonb_build_object('ok', false, 'reason', 'Informe um WhatsApp válido com DDD.');
  end if;
  -- Evita abuso: no máximo 2 horários aguardando sinal por telefone.
  if (select count(*) from appointments
      where studio_id = st.id and regexp_replace(client_phone, '\D', '', 'g') = digits
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

  insert into appointments (code, studio_id, service_id, service_name, starts_at, ends_at, client_name, client_phone,
                            notes, price, deposit, status, source, expires_at)
  values (new_code(), st.id, sv.id, sv.name, p_starts, p_starts + make_interval(mins => sv.minutes),
          trim(p_name), trim(p_phone), left(coalesce(p_notes, ''), 500), sv.price,
          round(sv.price * pct / 100, 2), case when pct > 0 then 'pending' else 'confirmed' end, 'site',
          case when pct > 0 then now() + make_interval(mins => hold) end)
  returning * into a;

  return jsonb_build_object('ok', true, 'code', a.code, 'status', a.status, 'price', a.price, 'deposit', a.deposit,
                            'expiresAt', a.expires_at, 'startsAt', a.starts_at, 'service', a.service_name);
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
  dur int;
  a appointments;
begin
  if not is_member(p_studio) then raise exception 'Acesso negado' using errcode = '42501'; end if;
  perform 1 from studios where id = p_studio for update;
  select * into sv from services where id = p_service and studio_id = p_studio;
  if sv.id is null then return jsonb_build_object('ok', false, 'reason', 'Escolha um serviço.'); end if;
  if length(trim(coalesce(p_name, ''))) < 2 then return jsonb_build_object('ok', false, 'reason', 'Informe o nome da cliente.'); end if;
  dur := coalesce(p_minutes, sv.minutes);
  if period_busy(p_studio, p_starts, p_starts + make_interval(mins => dur)) then
    return jsonb_build_object('ok', false, 'reason', 'Já existe agendamento ou bloqueio nesse horário.');
  end if;
  insert into appointments (code, studio_id, service_id, service_name, starts_at, ends_at, client_name, client_phone,
                            notes, price, deposit, status, source, confirmed_at)
  values (new_code(), p_studio, sv.id, sv.name, p_starts, p_starts + make_interval(mins => dur), trim(p_name),
          trim(coalesce(p_phone, '')), left(coalesce(p_notes, ''), 500), coalesce(p_price, sv.price), 0,
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
  for t in select unnest(array['services', 'hours', 'blocks', 'appointments']) loop
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
-- blocks e appointments: sem leitura pública (o site usa day_slots, sem dados pessoais).

revoke all on function public.set_appointment_status(uuid, text) from public, anon;
revoke all on function public.add_appointment(uuid, uuid, timestamptz, text, text, text, int, numeric) from public, anon;
grant execute on function public.public_studio(text) to anon, authenticated;
grant execute on function public.day_slots(text, uuid, date) to anon, authenticated;
grant execute on function public.days_summary(text, uuid, date, date) to anon, authenticated;
grant execute on function public.book(text, uuid, timestamptz, text, text, text) to anon, authenticated;
grant execute on function public.get_appointment(text) to anon, authenticated;
grant execute on function public.ping() to anon, authenticated;
grant execute on function public.set_appointment_status(uuid, text) to authenticated;
grant execute on function public.add_appointment(uuid, uuid, timestamptz, text, text, text, int, numeric) to authenticated;

-- =============================================================================
-- Primeiro acesso da agência (troque o e-mail e rode esta linha separadamente):
-- insert into public.agency_admins (email) values ('voce@exemplo.com') on conflict do nothing;
-- =============================================================================
