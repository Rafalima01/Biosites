#!/usr/bin/env bash
# Ambiente local de teste sem internet: Postgres + imitação da API do Supabase na porta 54321.
# Depois rode o app com:
#   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=dev npm run dev
# Login do painel: dono@ex.com / senha123
set -euo pipefail
cd "$(dirname "$0")/.."
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin | tail -1)}"
DIR="${DEV_DIR:-$HOME/.cache/hospedagem-dev}"
PORT=54330
as_pg() { if [ "$(id -u)" = 0 ]; then su postgres -c "$*"; else bash -c "$*"; fi; }
as_pg "$PGBIN/pg_ctl -D $DIR/data stop -m immediate" >/dev/null 2>&1 || true
rm -rf "$DIR" && mkdir -p "$DIR/files"
[ "$(id -u)" = 0 ] && chown postgres "$DIR"
as_pg "$PGBIN/initdb -D $DIR/data -A trust -U postgres >/dev/null && $PGBIN/pg_ctl -D $DIR/data -o '-p $PORT -k $DIR' -l $DIR/log start >/dev/null"
for f in tests/supabase-stub.sql supabase/schema.sql supabase/seed.sql; do
  psql -h "$DIR" -p $PORT -U postgres -q -v ON_ERROR_STOP=1 -f "$f" >/dev/null 2>&1
done
psql -h "$DIR" -p $PORT -U postgres -qc "insert into admins values ('dono@ex.com')"
pkill -f tests/dev-supabase.mjs 2>/dev/null || true
DATABASE_URL="postgres://postgres@localhost:$PORT/postgres?host=$DIR" STORAGE_DIR="$DIR/files" nohup node tests/dev-supabase.mjs > "$DIR/api.log" 2>&1 &
sleep 1 && echo "Banco e API de teste prontos (logs em $DIR)."
