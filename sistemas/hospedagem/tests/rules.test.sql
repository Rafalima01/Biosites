-- Testes das regras do banco. Rode com: npm run test:db (veja tests/run-db-tests.sh)
\set ON_ERROR_STOP 1
set client_min_messages = warning;
create temp table ctx as
select
  '22222222-2222-4222-8222-222222222222'::uuid as areia,
  '11111111-1111-4111-8111-111111111111'::uuid as coqueiros,
  '33333333-3333-4333-8333-333333333333'::uuid as brisa,
  -- próxima segunda-feira daqui a pelo menos 3 semanas (fora das promoções do seed)
  (current_date + 21 + (8 - extract(isodow from current_date + 21)::int) % 7) as mon;
grant select on ctx to anon, authenticated;

create or replace function pg_temp.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'FALHOU: %', msg; end if;
  raise notice 'ok - %', msg;
end $$;
set client_min_messages = notice;

-- ---------------- visitante (anon) ----------------
set role anon;
select pg_temp.ok((select count(*) from houses) = 3, 'anon vê as 3 casas ativas');
select pg_temp.ok((select count(*) from house_photos) = 9, 'anon vê as fotos');
select pg_temp.ok((select count(*) from packages) = 3, 'anon vê os pacotes');
select pg_temp.ok((select data->'brand'->>'name' from settings) = 'Maré Mansa', 'anon lê as configurações');

-- Orçamentos
select pg_temp.ok((quote_booking(areia, mon, mon + 2) ->> 'total')::numeric = 980 * 2 + 220, 'diária normal + limpeza') from ctx;
select pg_temp.ok((quote_booking(areia, mon + 4, mon + 6) ->> 'lodging')::numeric = 1190 * 2, 'sexta e sábado usam preço de fim de semana') from ctx;
select pg_temp.ok((quote_booking(areia, mon, mon + 2) ->> 'deposit')::numeric = round((980 * 2 + 220) * 0.30, 2), 'sinal de 30%') from ctx;
select pg_temp.ok(not (quote_booking(areia, mon, mon + 1) ->> 'ok')::boolean, 'respeita mínimo de noites') from ctx;
select pg_temp.ok(not (quote_booking(areia, current_date - 3, current_date - 1) ->> 'ok')::boolean, 'não aceita data passada') from ctx;

-- Reserva criada pelo visitante
create temp table r1 as select create_booking(areia, mon, mon + 3, 4, 'Ana Souza', '(71) 99999-0001', 'ana@ex.com', 'Chegamos tarde') as res from ctx;
select pg_temp.ok((res ->> 'ok')::boolean, 'cria reserva') from r1;
select pg_temp.ok((get_booking(res ->> 'code') ->> 'status') = 'pending', 'reserva nasce aguardando pagamento') from r1;
select pg_temp.ok((get_booking(res ->> 'code') ->> 'guestName') = 'Ana', 'consulta mostra só o primeiro nome') from r1;
select pg_temp.ok(get_booking(res ->> 'code') ->> 'phone' is null, 'consulta não expõe telefone') from r1;
select pg_temp.ok((select count(*) from bookings) = 0, 'anon NÃO lê a tabela de reservas');
select pg_temp.ok((select count(*) from house_busy(areia, mon - 7, mon + 30)) = 1, 'agenda pública mostra o período ocupado') from ctx;

-- Conflitos
select pg_temp.ok(not (create_booking(areia, mon + 1, mon + 4, 2, 'Bruno Lima', '71988880002') ->> 'ok')::boolean, 'bloqueia sobreposição') from ctx;
select pg_temp.ok((create_booking(areia, mon + 3, mon + 5, 2, 'Bruno Lima', '71988880002') ->> 'ok')::boolean, 'entrada no dia da saída de outra reserva') from ctx;
select pg_temp.ok(not (create_booking(areia, mon + 10, mon + 12, 11, 'Caio Reis', '71988880003') ->> 'ok')::boolean, 'respeita capacidade') from ctx;
select pg_temp.ok(not (create_booking(areia, mon + 10, mon + 12, 2, 'Caio Reis', '123') ->> 'ok')::boolean, 'valida telefone') from ctx;

-- Pacote
select pg_temp.ok(not (create_booking(coqueiros, date '2026-12-30', date '2027-01-01', 4, 'Dani Melo', '71988880004') ->> 'ok')::boolean, 'noites de pacote não vendem avulsas') from ctx
  where current_date < date '2026-12-29';
select pg_temp.ok((quote_booking(coqueiros, p.starts_on, p.ends_on, p.id) ->> 'total')::numeric = p.price, 'pacote usa valor fechado, sem limpeza')
  from packages p, ctx where p.tag = 'Réveillon' and p.starts_on > current_date;
select pg_temp.ok(not (quote_booking(coqueiros, p.starts_on, p.ends_on - 1, p.id) ->> 'ok')::boolean, 'pacote exige as datas exatas')
  from packages p, ctx where p.tag = 'Réveillon' and p.starts_on > current_date;

-- Escrita direta é proibida
do $$ begin
  insert into bookings (code, house_id, check_in, check_out, guests, guest_name, guest_phone, nights, lodging, cleaning, total, deposit)
  values ('X', (select areia from ctx), current_date + 90, current_date + 92, 1, 'Hacker', '000', 2, 1, 1, 1, 1);
  raise exception 'FALHOU: anon conseguiu inserir reserva direto';
exception when insufficient_privilege then raise notice 'ok - anon não insere reserva direto';
end $$;
do $$ begin
  update houses set price = 1;
  if (select count(*) from houses where price = 1) > 0 then raise exception 'FALHOU: anon alterou preço'; end if;
  raise notice 'ok - anon não altera casas';
end $$;
do $$ begin
  perform set_booking_status(gen_random_uuid(), 'confirmed');
  raise exception 'FALHOU: anon chamou set_booking_status';
exception when insufficient_privilege then raise notice 'ok - anon não confirma reservas';
end $$;
reset role;

-- ---------------- usuário logado que NÃO é anfitrião ----------------
set role authenticated;
select set_config('request.jwt.claims', '{"email":"intruso@ex.com"}', false);
select pg_temp.ok((select count(*) from bookings) = 0, 'logado sem permissão não vê reservas');
do $$ begin
  perform set_booking_status((select id from bookings limit 1), 'confirmed');
  raise notice 'ok - logado sem permissão não confirma (nada encontrado)';
exception when insufficient_privilege then raise notice 'ok - logado sem permissão não confirma';
end $$;
reset role;

-- ---------------- anfitrião ----------------
insert into admins (email) values ('dono@ex.com') on conflict do nothing;
set role authenticated;
select set_config('request.jwt.claims', '{"email":"Dono@ex.com"}', false);
select pg_temp.ok((select count(*) from bookings) = 2, 'anfitrião vê as reservas');
select pg_temp.ok((select guest_phone from bookings where guest_name = 'Ana Souza') = '(71) 99999-0001', 'anfitrião vê o telefone');
select set_booking_status((select id from bookings where guest_name = 'Ana Souza'), 'confirmed');
select pg_temp.ok((select status from bookings where guest_name = 'Ana Souza') = 'confirmed', 'anfitrião confirma reserva');
update houses set price = 1000 where slug = 'casa-areia';
select pg_temp.ok((select price from houses where slug = 'casa-areia') = 1000, 'anfitrião altera preço');
insert into blocks (house_id, starts_on, ends_on, reason) select areia, mon + 20, mon + 23, 'Reserva Airbnb' from ctx;
insert into promotions (house_id, label, starts_on, ends_on, percent_off) select areia, 'Promo', mon + 14, mon + 15, 50 from ctx;
reset role;
set role anon;
select pg_temp.ok(not (create_booking(areia, mon + 21, mon + 22, 2, 'Eva Dias', '71988880005') ->> 'ok')::boolean, 'bloqueio manual impede reserva') from ctx;
select pg_temp.ok((quote_booking(areia, mon + 14, mon + 16) ->> 'lodging')::numeric = 500 + 500, 'promoção de 50% aplicada') from ctx;
reset role;

-- Pendente vencido libera as datas
update bookings set expires_at = now() - interval '1 minute' where guest_name = 'Bruno Lima';
select code as bruno_code from bookings where guest_name = 'Bruno Lima' \gset
set role anon;
select pg_temp.ok((get_booking(:'bruno_code') ->> 'status') = 'expired', 'pendente vencido aparece como expirado');
select pg_temp.ok((create_booking(areia, mon + 3, mon + 5, 2, 'Fabi Rocha', '71988880006') ->> 'ok')::boolean, 'pendente vencido libera as datas') from ctx;
reset role;
set role authenticated;
select set_config('request.jwt.claims', '{"email":"dono@ex.com"}', false);
do $$ begin
  perform set_booking_status((select id from bookings where guest_name = 'Bruno Lima'), 'confirmed');
  raise exception 'FALHOU: confirmou reserva expirada cujas datas foram ocupadas';
exception when raise_exception then
  if sqlerrm like 'FALHOU%' then raise; end if;
  raise notice 'ok - não confirma reserva expirada se as datas foram ocupadas';
end $$;
reset role;
\echo TODOS OS TESTES PASSARAM
