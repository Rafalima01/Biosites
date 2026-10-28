#!/usr/bin/env bash
# Teste de concorrência: duas reservas simultâneas das mesmas noites -> só uma pode ser gravada.
# Uso: bash tests/race.sh (como usuário com acesso ao initdb/pg_ctl do PostgreSQL 16)
set -e
D=$(mktemp -d); P=54398; B=/usr/lib/postgresql/16/bin
$B/initdb -D $D/data -A trust -U postgres >/dev/null; $B/pg_ctl -D $D/data -o "-p $P -k $D" -l $D/log start >/dev/null
cd /home/user/biosites/sistemas/hospedagem
for f in tests/supabase-stub.sql supabase/schema.sql supabase/seed.sql; do psql -h $D -p $P -U postgres -q -f $f >/dev/null 2>&1; done
Q="select create_booking('22222222-2222-4222-8222-222222222222', current_date+40, current_date+43, 2, 'Pessoa', '7199999000'||"
# A segura a trava por 2s dentro da transação; B tenta as mesmas datas no meio disso.
(psql -h $D -p $P -U postgres -qAt -c "begin; set local role anon; $Q'1') ->> 'ok'; select pg_sleep(2); commit;" | head -1 | sed 's/^/A: /') &
sleep 0.5
psql -h $D -p $P -U postgres -qAt -c "set role anon; $Q'2') ->> 'reason';" | sed 's/^/B: /'
wait
psql -h $D -p $P -U postgres -qAt -c "select 'reservas gravadas: '||count(*) from bookings"
$B/pg_ctl -D $D/data stop -m immediate >/dev/null; rm -rf $D
