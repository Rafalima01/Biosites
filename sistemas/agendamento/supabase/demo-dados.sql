-- =============================================================================
-- DADOS DE DEMONSTRAÇÃO do studio-livia (fictício): clientes e atendimentos do mês passado,
-- deste mês e dos próximos 14 dias, para o dashboard e a agenda do painel de demonstração.
-- Rode depois do seed.sql (ou do instalar-demo.sql). Pode rodar de novo: refaz tudo do zero.
-- Só mexe no que ele mesmo criou (marcado como 'demo'); nada de outros studios.
-- Os atendimentos entram como encaixe do painel, então não disparam aviso no celular.
-- =============================================================================
do $$
declare
  sid uuid := (select id from public.studios where slug = 'studio-livia');
  tz text := 'America/Sao_Paulo';
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  nomes text[] := array[
    'Ana Paula Souza', 'Beatriz Lima', 'Camila Rocha', 'Daniela Alves', 'Eduarda Santos', 'Fernanda Costa',
    'Gabriela Nunes', 'Helena Martins', 'Isabela Freitas', 'Juliana Ribeiro', 'Larissa Gomes', 'Mariana Dias',
    'Natália Barbosa', 'Patrícia Melo', 'Rafaela Teixeira', 'Sabrina Moura', 'Tatiane Cardoso', 'Vanessa Pires',
    'Yasmin Correia', 'Luana Batista'];
  d date;
  t time;
  n int;
  r float;
  st text;
  ini timestamptz;
  fim timestamptz;
  sv record;
  cl record;
begin
  if sid is null then
    raise exception 'Studio de demonstração não encontrado: rode antes o seed.sql (ou instalar-demo.sql).';
  end if;
  perform setseed(0.42);

  delete from public.appointments where studio_id = sid and admin_notes = 'demo';
  delete from public.clients where studio_id = sid and notes = 'demo';

  for i in 1 .. array_length(nomes, 1) loop
    -- Aniversários: as 4 primeiras fazem aniversário neste mês (para a tela de aniversariantes).
    insert into public.clients (studio_id, phone, name, notes, created_at, birth_day, birth_month)
    values (sid, '719000000' || lpad(i::text, 2, '0'), nomes[i], 'demo', now() - (random() * 55 || ' days')::interval,
            ((i * 11) % 28) + 1, case when i <= 4 then extract(month from hoje)::int else ((i * 7) % 12) + 1 end)
    on conflict (studio_id, phone) do nothing;
  end loop;

  for d in select generate_series(date_trunc('month', hoje) - interval '1 month', hoje + 14, interval '1 day')::date loop
    continue when extract(dow from d) = 0; -- domingo fechado
    n := 2 + floor(random() * 4)::int;     -- 2 a 5 atendimentos no dia
    t := time '09:00';
    for i in 1 .. n loop
      t := t + (floor(random() * 3) * 30 || ' minutes')::interval;
      select id, name, minutes, price into sv from public.services where studio_id = sid and active order by random() limit 1;
      if (t < time '12:00' and t + make_interval(mins => sv.minutes) > time '12:00') or (t >= time '12:00' and t < time '13:00') then
        t := time '13:00'; -- não invade o almoço (12h às 13h)
      end if;
      exit when t + make_interval(mins => sv.minutes) > time '19:00' or t < time '09:00';
      ini := (d + t) at time zone tz;
      fim := ini + make_interval(mins => sv.minutes);
      r := random();
      if fim <= now() then
        st := case when r < 0.80 then 'done' when r < 0.88 then 'confirmed' when r < 0.94 then 'no_show' else 'cancelled' end;
      else
        st := case when r < 0.10 and d <= hoje + 3 then 'pending' when r < 0.95 then 'confirmed' else 'cancelled' end;
      end if;
      select id, name, phone into cl from public.clients where studio_id = sid and notes = 'demo' order by random() limit 1;
      insert into public.appointments (
        code, studio_id, service_id, service_name, starts_at, ends_at, client_id, client_name, client_phone,
        price, deposit, status, source, expires_at, admin_notes, created_at, confirmed_at, cancelled_at
      ) values (
        'D' || upper(substr(md5(random()::text), 1, 6)), sid, sv.id, sv.name, ini, fim, cl.id, cl.name, cl.phone,
        sv.price, round(sv.price * 0.3, 2), st, 'painel',
        case when st = 'pending' then now() + interval '90 minutes' end,
        'demo', least(ini, now()) - interval '3 days',
        case when st in ('confirmed', 'done', 'no_show') then least(ini, now()) - interval '2 days' end,
        case when st = 'cancelled' then least(ini, now()) - interval '1 day' end
      );
      t := t + make_interval(mins => sv.minutes);
    end loop;
  end loop;

  -- Despesas do mês passado e deste mês (só até hoje): aluguel, contas, material, marketing e taxas.
  delete from public.expenses where studio_id = sid;
  insert into public.expenses (studio_id, spent_on, description, category, amount)
  select sid, x.dia, x.descricao, x.categoria, x.valor
  from (
    select (m + (v.dia - 1) * interval '1 day')::date as dia, v.descricao, v.categoria, v.valor
    from generate_series(date_trunc('month', hoje) - interval '1 month', date_trunc('month', hoje), interval '1 month') m
    cross join (values
      (5, 'Aluguel da sala', 'Aluguel', 900.00),
      (8, 'Gel, tips e lixas', 'Material', 236.40),
      (10, 'Luz, água e internet', 'Contas', 284.90),
      (14, 'Anúncio no Instagram', 'Marketing', 150.00),
      (18, 'Esmaltes e removedor', 'Material', 128.70),
      (22, 'Henna e linha de sobrancelha', 'Material', 96.00),
      (25, 'Taxas da maquininha', 'Taxas', 87.35),
      (27, 'Cílios e cola', 'Material', 174.20)
    ) as v (dia, descricao, categoria, valor)
  ) x
  where x.dia <= hoje;

  -- Produtos e estoque (alguns já no mínimo, para mostrar o aviso "Acabando").
  delete from public.products where studio_id = sid;
  insert into public.products (studio_id, name, category, unit, quantity, min_quantity, unit_cost, per_pack) values
    (sid, 'Gel construtor rosa', 'Unhas', 'un', 4, 2, 48.90, null),
    (sid, 'Gel construtor nude', 'Unhas', 'un', 1, 2, 48.90, null),
    (sid, 'Tips bailarina', 'Unhas', 'cx', 2, 1, 39.90, 500),
    (sid, 'Esmalte em gel (cores)', 'Unhas', 'un', 18, 6, 22.50, null),
    (sid, 'Lixa 100/180', 'Descartáveis', 'pct', 3, 2, 17.00, 12),
    (sid, 'Removedor de esmalte (1 litro)', 'Unhas', 'un', 2, 1, 45.00, null),
    (sid, 'Henna para sobrancelha', 'Sobrancelhas', 'un', 1, 1, 34.90, null),
    (sid, 'Linha para design', 'Sobrancelhas', 'un', 6, 2, 8.50, null),
    (sid, 'Cílios em tufos', 'Cílios', 'cx', 5, 2, 29.90, 120),
    (sid, 'Cola para cílios (7 g)', 'Cílios', 'un', 3, 2, 25.00, null),
    (sid, 'Luvas descartáveis', 'Descartáveis', 'cx', 2, 1, 32.00, 100),
    (sid, 'Pinça de precisão', 'Sobrancelhas', 'par', 2, 1, 18.00, null);
end $$;

-- Conferência
select status, count(*) as atendimentos, sum(price) as valor
from public.appointments a join public.studios s on s.id = a.studio_id
where s.slug = 'studio-livia' and a.admin_notes = 'demo'
group by status order by status;
