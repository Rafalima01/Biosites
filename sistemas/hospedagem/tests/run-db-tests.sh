#!/usr/bin/env bash
# Sobe um Postgres temporário, aplica o schema e roda os testes das regras.
# Requer PostgreSQL 16 instalado (initdb/pg_ctl). Uso: npm run test:db
set -euo pipefail
cd "$(dirname "$0")/.."
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1)}"
DIR="$(mktemp -d)"
PORT=54399
trap '"$PGBIN/pg_ctl" -D "$DIR/data" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$DIR"' EXIT
"$PGBIN/initdb" -D "$DIR/data" -A trust -U postgres >/dev/null
"$PGBIN/pg_ctl" -D "$DIR/data" -o "-p $PORT -k $DIR" -l "$DIR/log" start >/dev/null
run() { psql -h "$DIR" -p $PORT -U postgres -v ON_ERROR_STOP=1 -q "$@"; }
run -f tests/supabase-stub.sql >/dev/null 2>&1
run -f supabase/schema.sql >/dev/null 2>&1
run -f supabase/seed.sql >/dev/null
run -f supabase/schema.sql >/dev/null 2>&1   # rodar duas vezes não pode quebrar
run -f tests/rules.test.sql 2>&1 | grep -E "ok - |FALHOU|ERROR|PASSARAM" | sed 's/.*NOTICE:  //'
