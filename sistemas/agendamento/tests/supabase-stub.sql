-- Imita o mínimo do Supabase para testar schema.sql num Postgres comum (ou no PGlite).
do $$ begin
  create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin
  create role authenticated nologin; exception when duplicate_object then null; end $$;
create schema if not exists auth;
create or replace function auth.jwt() returns jsonb language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema public, auth to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
-- pg_net de mentira: guarda as chamadas numa tabela para os testes conferirem.
create schema if not exists net;
create table if not exists net._chamadas (id serial primary key, url text, body jsonb, headers jsonb);
create or replace function net.http_post(url text, body jsonb default '{}', params jsonb default '{}', headers jsonb default '{}', timeout_milliseconds int default 5000)
returns bigint language sql as $$ insert into net._chamadas (url, body, headers) values (url, body, headers) returning id::bigint $$;
