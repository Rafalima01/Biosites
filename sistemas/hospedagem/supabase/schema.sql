-- =============================================================================
-- Sistema de Hospedagem · banco de dados (Supabase / Postgres)
--
-- Como instalar: no painel do Supabase, abra SQL Editor, cole este arquivo
-- inteiro e clique em Run. Depois rode `seed.sql` se quiser os dados de exemplo.
-- Pode rodar de novo sem perder dados: tudo usa "if not exists" / "or replace".
--
-- Regras importantes ficam AQUI, no banco, e não no navegador:
--   * o preço da reserva é calculado pelo servidor (o hóspede não consegue alterar);
--   * duas pessoas não conseguem reservar as mesmas noites ao mesmo tempo;
--   * dados dos hóspedes só são visíveis para o anfitrião logado.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Anfitriões com acesso ao painel (e-mails cadastrados em Authentication > Users)
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Data de hoje no fuso do Brasil (o servidor do Supabase usa UTC).
create or replace function public.today_br()
returns date
language sql stable
as $$ select (now() at time zone 'America/Sao_Paulo')::date $$;

-- ---------------------------------------------------------------------------
-- Configurações e personalização do site (uma linha só, em JSON)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Casas
-- ---------------------------------------------------------------------------
create table if not exists public.houses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (length(name) between 2 and 80),
  location text not null default '',
  tag text not null default '',
  summary text not null default '',
  description text not null default '',
  guests int not null default 2 check (guests between 1 and 100),
  bedrooms int not null default 1 check (bedrooms >= 0),
  baths int not null default 1 check (baths >= 0),
  price numeric(10, 2) not null check (price > 0),
  weekend_price numeric(10, 2) check (weekend_price > 0),
  cleaning_fee numeric(10, 2) not null default 0 check (cleaning_fee >= 0),
  min_nights int not null default 1 check (min_nights between 1 and 60),
  amenities text[] not null default '{}',
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.house_photos (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses (id) on delete cascade,
  url text not null,
  path text, -- caminho no Storage (fotos enviadas pelo painel); nulo para links externos
  alt text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists house_photos_house_idx on public.house_photos (house_id, sort);

-- ---------------------------------------------------------------------------
-- Promoções e preços especiais por período
--   percent_off: desconto em % sobre a diária (ex.: 20 = 20% off)
--   nightly_price: diária fixa no período (serve também para alta temporada)
--   house_id nulo = vale para todas as casas
--   ends_on é a ÚLTIMA NOITE com o preço especial (inclusiva)
-- ---------------------------------------------------------------------------
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  house_id uuid references public.houses (id) on delete cascade,
  label text not null default 'Promoção',
  starts_on date not null,
  ends_on date not null,
  percent_off numeric(5, 2) check (percent_off > 0 and percent_off < 100),
  nightly_price numeric(10, 2) check (nightly_price > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  check ((percent_off is null) <> (nightly_price is null))
);

-- ---------------------------------------------------------------------------
-- Pacotes de datas especiais (valor fechado). starts_on = entrada, ends_on = saída.
-- As noites do pacote não podem ser reservadas avulsas.
-- ---------------------------------------------------------------------------
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses (id) on delete cascade,
  title text not null,
  tag text not null default '',
  starts_on date not null,
  ends_on date not null,
  price numeric(10, 2) not null check (price > 0),
  note text not null default '',
  photo_url text not null default '',
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  check (ends_on > starts_on)
);

-- ---------------------------------------------------------------------------
-- Bloqueios manuais (reserva feita no Airbnb, manutenção, uso próprio...).
-- ends_on = dia de saída (a noite desse dia fica livre).
-- ---------------------------------------------------------------------------
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses (id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  reason text not null default '',
  created_at timestamptz not null default now(),
  check (ends_on > starts_on)
);
create index if not exists blocks_house_idx on public.blocks (house_id, starts_on);

-- ---------------------------------------------------------------------------
-- Reservas
--   pending   = aguardando o Pix do sinal (segura as datas até expires_at)
--   confirmed = anfitrião confirmou o pagamento
--   cancelled = cancelada pelo anfitrião
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  house_id uuid not null references public.houses (id) on delete restrict,
  package_id uuid references public.packages (id) on delete set null,
  check_in date not null,
  check_out date not null,
  guests int not null check (guests >= 1),
  guest_name text not null,
  guest_phone text not null,
  guest_email text not null default '',
  notes text not null default '',
  nights int not null,
  lodging numeric(10, 2) not null,
  cleaning numeric(10, 2) not null,
  total numeric(10, 2) not null,
  deposit numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  expires_at timestamptz,
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  check (check_out > check_in)
);
create index if not exists bookings_house_idx on public.bookings (house_id, check_in);
create index if not exists bookings_status_idx on public.bookings (status, created_at desc);

-- =============================================================================
-- Regras de preço e disponibilidade
-- =============================================================================

-- Preço da noite que começa em `p_day` (sexta e sábado usam o preço de fim de semana).
create or replace function public.nightly_price(p_house public.houses, p_day date)
returns numeric
language plpgsql stable
as $$
declare
  base numeric := case when extract(dow from p_day) in (5, 6)
                       then coalesce(p_house.weekend_price, p_house.price)
                       else p_house.price end;
  promo public.promotions;
begin
  -- Promoção específica da casa vence a geral; entre iguais, vale a mais recente.
  select * into promo from public.promotions
  where active and p_day between starts_on and ends_on
    and (house_id = p_house.id or house_id is null)
  order by (house_id is null), created_at desc
  limit 1;

  if promo.id is null then return base; end if;
  if promo.nightly_price is not null then return promo.nightly_price; end if;
  return round(base * (1 - promo.percent_off / 100), 2);
end;
$$;

-- Motivo pelo qual o período [p_in, p_out) não está livre, ou null se estiver.
create or replace function public.unavailable_reason(p_house uuid, p_in date, p_out date, p_package uuid default null)
returns text
language sql stable security definer set search_path = public
as $$
  select case
    when exists (
      select 1 from bookings b
      where b.house_id = p_house
        and daterange(b.check_in, b.check_out) && daterange(p_in, p_out)
        and (b.status = 'confirmed' or (b.status = 'pending' and b.expires_at > now()))
    ) or exists (
      select 1 from blocks k
      where k.house_id = p_house and daterange(k.starts_on, k.ends_on) && daterange(p_in, p_out)
    ) then 'Essas datas não estão mais disponíveis.'
    when exists (
      select 1 from packages p
      where p.house_id = p_house and p.active
        and p.id is distinct from p_package
        and daterange(p.starts_on, p.ends_on) && daterange(p_in, p_out)
    ) then 'Essas datas fazem parte de um pacote especial.'
  end;
$$;

-- Orçamento oficial (o mesmo usado na criação da reserva).
create or replace function public.quote_booking(p_house uuid, p_check_in date, p_check_out date, p_package uuid default null)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  h houses;
  pkg packages;
  s jsonb := (select data from settings where id = 1);
  deposit_pct numeric := coalesce((s #>> '{booking,depositPercent}')::numeric, 30);
  n int := p_check_out - p_check_in;
  lodging numeric := 0;
  d date;
  reason text;
begin
  select * into h from houses where id = p_house and active;
  if h.id is null then return jsonb_build_object('ok', false, 'reason', 'Casa não encontrada.'); end if;
  if p_check_in < today_br() then return jsonb_build_object('ok', false, 'reason', 'A data de entrada já passou.'); end if;
  if n < 1 then return jsonb_build_object('ok', false, 'reason', 'A saída precisa ser depois da entrada.'); end if;
  if n > 60 then return jsonb_build_object('ok', false, 'reason', 'Para estadias acima de 60 noites, fale conosco.'); end if;

  if p_package is not null then
    select * into pkg from packages where id = p_package and active and house_id = p_house;
    if pkg.id is null or pkg.starts_on <> p_check_in or pkg.ends_on <> p_check_out then
      return jsonb_build_object('ok', false, 'reason', 'Pacote indisponível para essas datas.');
    end if;
  elsif n < h.min_nights then
    return jsonb_build_object('ok', false, 'reason', format('Mínimo de %s noites nesta casa.', h.min_nights));
  end if;

  reason := unavailable_reason(p_house, p_check_in, p_check_out, p_package);
  if reason is not null then return jsonb_build_object('ok', false, 'reason', reason); end if;

  if pkg.id is not null then
    lodging := pkg.price;
  else
    d := p_check_in;
    while d < p_check_out loop
      lodging := lodging + nightly_price(h, d);
      d := d + 1;
    end loop;
  end if;

  return jsonb_build_object(
    'ok', true,
    'nights', n,
    'lodging', lodging,
    'cleaning', case when pkg.id is null then h.cleaning_fee else 0 end,
    'total', lodging + case when pkg.id is null then h.cleaning_fee else 0 end,
    'deposit', round((lodging + case when pkg.id is null then h.cleaning_fee else 0 end) * deposit_pct / 100, 2),
    'depositPercent', deposit_pct
  );
end;
$$;

-- Código curto e legível da reserva (sem 0/O, 1/I/L).
create or replace function public.new_booking_code()
returns text
language plpgsql volatile
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := '';
    for i in 1..8 loop
      c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from bookings where code = c);
  end loop;
  return c;
end;
$$;

-- Cria a reserva (único jeito do público gravar uma reserva).
create or replace function public.create_booking(
  p_house uuid,
  p_check_in date,
  p_check_out date,
  p_guests int,
  p_name text,
  p_phone text,
  p_email text default '',
  p_notes text default '',
  p_package uuid default null
)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  h houses;
  q jsonb;
  s jsonb := (select data from settings where id = 1);
  hold_hours int := coalesce((s #>> '{booking,holdHours}')::int, 24);
  phone_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  b bookings;
begin
  -- Trava a casa: reservas simultâneas da mesma casa entram uma de cada vez.
  select * into h from houses where id = p_house and active for update;
  if h.id is null then return jsonb_build_object('ok', false, 'reason', 'Casa não encontrada.'); end if;

  if length(trim(coalesce(p_name, ''))) < 3 then
    return jsonb_build_object('ok', false, 'reason', 'Informe seu nome completo.');
  end if;
  if length(phone_digits) < 10 or length(phone_digits) > 13 then
    return jsonb_build_object('ok', false, 'reason', 'Informe um WhatsApp válido com DDD.');
  end if;
  if coalesce(p_email, '') <> '' and p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'reason', 'E-mail inválido.');
  end if;
  if p_guests is null or p_guests < 1 or p_guests > h.guests then
    return jsonb_build_object('ok', false, 'reason', format('Esta casa recebe até %s hóspedes.', h.guests));
  end if;
  -- Evita abuso: no máximo 3 reservas aguardando pagamento por telefone.
  if (select count(*) from bookings
      where regexp_replace(guest_phone, '\D', '', 'g') = phone_digits
        and status = 'pending' and expires_at > now()) >= 3 then
    return jsonb_build_object('ok', false, 'reason', 'Você já tem reservas aguardando pagamento. Fale conosco pelo WhatsApp.');
  end if;

  q := quote_booking(p_house, p_check_in, p_check_out, p_package);
  if not (q ->> 'ok')::boolean then return q; end if;

  insert into bookings (code, house_id, package_id, check_in, check_out, guests, guest_name, guest_phone,
                        guest_email, notes, nights, lodging, cleaning, total, deposit, expires_at)
  values (new_booking_code(), p_house, p_package, p_check_in, p_check_out, p_guests, trim(p_name), trim(p_phone),
          lower(trim(coalesce(p_email, ''))), left(coalesce(p_notes, ''), 1000),
          (q ->> 'nights')::int, (q ->> 'lodging')::numeric, (q ->> 'cleaning')::numeric,
          (q ->> 'total')::numeric, (q ->> 'deposit')::numeric, now() + make_interval(hours => hold_hours))
  returning * into b;

  return jsonb_build_object('ok', true, 'code', b.code);
end;
$$;

-- Consulta pública de uma reserva pelo código (sem telefone/e-mail).
create or replace function public.get_booking(p_code text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'code', b.code,
    'status', case when b.status = 'pending' and b.expires_at <= now() then 'expired' else b.status end,
    'house', h.name,
    'houseSlug', h.slug,
    'package', p.title,
    'checkIn', b.check_in,
    'checkOut', b.check_out,
    'nights', b.nights,
    'guests', b.guests,
    'guestName', split_part(b.guest_name, ' ', 1),
    'lodging', b.lodging,
    'cleaning', b.cleaning,
    'total', b.total,
    'deposit', b.deposit,
    'expiresAt', b.expires_at,
    'createdAt', b.created_at
  )
  from bookings b
  join houses h on h.id = b.house_id
  left join packages p on p.id = b.package_id
  where b.code = upper(trim(p_code));
$$;

-- Períodos ocupados de uma casa (sem dados pessoais), para a agenda pública.
create or replace function public.house_busy(p_house uuid, p_from date, p_to date)
returns table (starts_on date, ends_on date)
language sql stable security definer set search_path = public
as $$
  select b.check_in, b.check_out from bookings b
  where b.house_id = p_house
    and (b.status = 'confirmed' or (b.status = 'pending' and b.expires_at > now()))
    and daterange(b.check_in, b.check_out) && daterange(p_from, p_to)
  union all
  select k.starts_on, k.ends_on from blocks k
  where k.house_id = p_house and daterange(k.starts_on, k.ends_on) && daterange(p_from, p_to)
  order by 1;
$$;

-- Ações do anfitrião sobre reservas.
create or replace function public.set_booking_status(p_id uuid, p_status text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  b bookings;
begin
  if not is_admin() then raise exception 'Acesso negado' using errcode = '42501'; end if;
  if p_status not in ('confirmed', 'cancelled', 'pending') then raise exception 'Status inválido'; end if;
  select * into b from bookings where id = p_id for update;
  if b.id is null then raise exception 'Reserva não encontrada'; end if;
  -- Reativar ou confirmar uma reserva expirada só se as datas continuarem livres.
  if p_status in ('confirmed', 'pending') and b.status <> 'confirmed'
     and (b.status = 'cancelled' or b.expires_at <= now()) then
    perform 1 from houses where id = b.house_id for update;
    if exists (
      select 1 from bookings o
      where o.house_id = b.house_id and o.id <> b.id
        and daterange(o.check_in, o.check_out) && daterange(b.check_in, b.check_out)
        and (o.status = 'confirmed' or (o.status = 'pending' and o.expires_at > now()))
    ) or exists (
      select 1 from blocks k
      where k.house_id = b.house_id and daterange(k.starts_on, k.ends_on) && daterange(b.check_in, b.check_out)
    ) then
      raise exception 'As datas desta reserva já foram ocupadas por outra.';
    end if;
  end if;
  update bookings set
    status = p_status,
    confirmed_at = case when p_status = 'confirmed' then now() else confirmed_at end,
    cancelled_at = case when p_status = 'cancelled' then now() else null end,
    expires_at = case when p_status = 'pending' then now() + interval '24 hours' else expires_at end
  where id = p_id;
end;
$$;

-- =============================================================================
-- Segurança (Row Level Security)
-- =============================================================================
alter table public.admins enable row level security;
alter table public.settings enable row level security;
alter table public.houses enable row level security;
alter table public.house_photos enable row level security;
alter table public.promotions enable row level security;
alter table public.packages enable row level security;
alter table public.blocks enable row level security;
alter table public.bookings enable row level security;

do $$
declare t text;
begin
  -- Recria as políticas para o arquivo poder ser rodado de novo.
  for t in select unnest(array['admins','settings','houses','house_photos','promotions','packages','blocks','bookings']) loop
    execute format('drop policy if exists "admin total" on public.%I', t);
    execute format('create policy "admin total" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "leitura publica" on public.settings;
create policy "leitura publica" on public.settings for select using (true);

drop policy if exists "leitura publica" on public.houses;
create policy "leitura publica" on public.houses for select using (active);

drop policy if exists "leitura publica" on public.house_photos;
create policy "leitura publica" on public.house_photos for select
  using (exists (select 1 from public.houses h where h.id = house_id and h.active));

drop policy if exists "leitura publica" on public.promotions;
create policy "leitura publica" on public.promotions for select using (active);

drop policy if exists "leitura publica" on public.packages;
create policy "leitura publica" on public.packages for select using (active);
-- blocks e bookings: sem leitura pública (a agenda usa house_busy, sem dados pessoais).

revoke all on function public.set_booking_status(uuid, text) from public, anon;
grant execute on function public.create_booking(uuid, date, date, int, text, text, text, text, uuid) to anon, authenticated;
grant execute on function public.quote_booking(uuid, date, date, uuid) to anon, authenticated;
grant execute on function public.get_booking(text) to anon, authenticated;
grant execute on function public.house_busy(uuid, date, date) to anon, authenticated;
grant execute on function public.set_booking_status(uuid, text) to authenticated;

-- =============================================================================
-- Fotos (Supabase Storage): leitura pública, envio só pelo anfitrião
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

drop policy if exists "fotos: anfitriao envia" on storage.objects;
create policy "fotos: anfitriao envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and public.is_admin());
drop policy if exists "fotos: anfitriao altera" on storage.objects;
create policy "fotos: anfitriao altera" on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and public.is_admin());
drop policy if exists "fotos: anfitriao apaga" on storage.objects;
create policy "fotos: anfitriao apaga" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and public.is_admin());

-- =============================================================================
-- Último passo: cadastre o e-mail do anfitrião (o mesmo criado em Authentication > Users).
-- Troque o e-mail abaixo antes de rodar, ou rode esta linha depois separadamente.
-- =============================================================================
-- insert into public.admins (email) values ('anfitriao@exemplo.com') on conflict do nothing;
