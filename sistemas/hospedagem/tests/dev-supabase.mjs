// Imitação mínima da API do Supabase (Auth, PostgREST e Storage) sobre um Postgres local,
// só para testar o sistema sem internet. NÃO use em produção.
//
// As consultas rodam com os papéis `anon`/`authenticated` e com o e-mail do usuário em
// `request.jwt.claims`, então as regras de segurança (RLS) do schema.sql valem de verdade.
//
// Uso: DATABASE_URL=postgres://postgres@/postgres?host=/tmp/pg node tests/dev-supabase.mjs
// Usuários de teste: dono@ex.com / senha123 (anfitrião) e intruso@ex.com / senha123.
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const PORT = Number(process.env.PORT || 54321);
const SECRET = 'dev-secret';
const FILES = process.env.STORAGE_DIR || path.join(process.cwd(), '.dev-storage');
// Como o PostgREST, devolve numeric como número no JSON.
pg.types.setTypeParser(1700, (v) => (v === null ? null : Number(v)));
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const USERS = {
  'dono@ex.com': { id: '00000000-0000-4000-8000-000000000001', password: 'senha123' },
  'intruso@ex.com': { id: '00000000-0000-4000-8000-000000000002', password: 'senha123' },
};

// ---------------- JWT ----------------
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
function sign(payload) {
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const body = b64(payload);
  const sig = crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}
function verify(token) {
  const [h, b, s] = String(token || '').split('.');
  if (!s) return null;
  const ok = crypto.createHmac('sha256', SECRET).update(`${h}.${b}`).digest('base64url') === s;
  if (!ok) return null;
  const p = JSON.parse(Buffer.from(b, 'base64url').toString());
  return p.exp * 1000 > Date.now() ? p : null;
}
const userObj = (email) => ({
  id: USERS[email].id,
  aud: 'authenticated',
  role: 'authenticated',
  email,
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
});
function session(email) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const access_token = sign({ sub: USERS[email].id, email, role: 'authenticated', aud: 'authenticated', exp, iat: exp - 3600 });
  return { access_token, token_type: 'bearer', expires_in: 3600, expires_at: exp, refresh_token: `r.${b64({ email })}`, user: userObj(email) };
}
function claimsOf(req) {
  const auth = req.headers.authorization || '';
  const p = verify(auth.replace(/^Bearer /, ''));
  return p?.role === 'authenticated' ? p : null;
}

// ---------------- helpers ----------------
const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
};
const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
const ident = (s) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(s)) throw Object.assign(new Error(`identificador inválido: ${s}`), { status: 400 });
  return `"${s}"`;
};
const singular = (t) => t.replace(/s$/, '');

async function asRole(claims, fn) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(`set local role ${claims ? 'authenticated' : 'anon'}`);
    await client.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims || { role: 'anon' })]);
    const out = await fn(client);
    await client.query('commit');
    return out;
  } catch (e) {
    await client.query('rollback').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

const columnsCache = new Map();
async function columns(table) {
  if (!columnsCache.has(table)) {
    const { rows } = await pool.query("select column_name from information_schema.columns where table_schema = 'public' and table_name = $1", [table]);
    columnsCache.set(table, new Set(rows.map((r) => r.column_name)));
  }
  return columnsCache.get(table);
}

// select=*, house_photos(*), houses(name)
function parseSelect(sel = '*') {
  const items = [];
  let depth = 0;
  let cur = '';
  for (const ch of sel) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      items.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) items.push(cur.trim());
  return items.map((it) => {
    const m = it.match(/^([a-z_]+)\((.*)\)$/i);
    return m ? { rel: m[1], select: m[2] } : { col: it };
  });
}

async function selectSql(table, sel, alias) {
  const parts = [];
  for (const item of parseSelect(sel)) {
    if (item.col) {
      parts.push(item.col === '*' ? `${alias}.*` : `${alias}.${ident(item.col)}`);
      continue;
    }
    const rel = item.rel;
    const sub = `${rel}_${Math.random().toString(36).slice(2, 7)}`;
    const inner = await selectSql(rel, item.select, sub);
    const tcols = await columns(table);
    if (tcols.has(`${singular(rel)}_id`)) {
      parts.push(`(select row_to_json(x) from (select ${inner} from public.${ident(rel)} ${sub} where ${sub}.id = ${alias}.${ident(`${singular(rel)}_id`)}) x) as ${ident(rel)}`);
    } else {
      parts.push(`coalesce((select json_agg(x) from (select ${inner} from public.${ident(rel)} ${sub} where ${sub}.${ident(`${singular(table)}_id`)} = ${alias}.id) x), '[]'::json) as ${ident(rel)}`);
    }
  }
  return parts.join(', ');
}

const OPS = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=', like: 'like', ilike: 'ilike' };
function filterSql(key, raw, params) {
  const m = String(raw).match(/^(not\.)?([a-z]+)\.(.*)$/s);
  if (!m) return null;
  const [, not, op, value] = m;
  const col = ident(key);
  let sql;
  if (op === 'is') sql = `${col} is ${value === 'null' ? 'null' : value === 'true' ? 'true' : 'false'}`;
  else if (op === 'in') {
    const vals = value.replace(/^\(|\)$/g, '').split(',').map((v) => v.replace(/^"|"$/g, ''));
    sql = `${col}::text = any($${params.push(vals)})`;
  } else if (OPS[op]) {
    const v = op.endsWith('like') ? value.replace(/\*/g, '%') : value;
    sql = `${col} ${OPS[op]} $${params.push(v)}`;
  } else return null;
  return not ? `not (${sql})` : sql;
}
function whereSql(search, params) {
  const conds = [];
  for (const [k, v] of search) {
    if (['select', 'order', 'limit', 'offset', 'columns', 'on_conflict'].includes(k)) continue;
    if (k === 'or') {
      const inner = v.replace(/^\(|\)$/g, '').split(',').map((part) => {
        const [col, ...rest] = part.split('.');
        return filterSql(col, rest.join('.'), params);
      });
      conds.push(`(${inner.filter(Boolean).join(' or ')})`);
      continue;
    }
    const c = filterSql(k, v, params);
    if (c) conds.push(c);
  }
  return conds.length ? `where ${conds.join(' and ')}` : '';
}
function orderSql(order) {
  if (!order) return '';
  return `order by ${order
    .split(',')
    .map((o) => {
      const [col, dir, nulls] = o.split('.');
      return `${ident(col)} ${dir === 'desc' ? 'desc' : 'asc'}${nulls === 'nullsfirst' ? ' nulls first' : nulls === 'nullslast' ? ' nulls last' : ''}`;
    })
    .join(', ')}`;
}

function pgError(res, e) {
  const status = e.status || (e.code === '42501' ? 403 : e.code === '23505' ? 409 : e.code === 'P0001' ? 400 : 400);
  send(res, status, { code: e.code || 'PGRST', message: e.message, details: e.detail || null, hint: null });
}

// ---------------- REST ----------------
async function rest(req, res, url, table) {
  const claims = claimsOf(req);
  const search = url.searchParams;
  const wantsObject = /vnd\.pgrst\.object/.test(req.headers.accept || '');
  const prefer = req.headers.prefer || '';

  if (table.startsWith('rpc/')) {
    const fn = table.slice(4);
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    const keys = Object.keys(body);
    const args = keys.map((k, i) => `${ident(k)} := $${i + 1}`).join(', ');
    const { rows: meta } = await pool.query(
      "select p.proretset, t.typname from pg_proc p join pg_type t on t.oid = p.prorettype where p.proname = $1 and p.pronamespace = 'public'::regnamespace limit 1",
      [fn],
    );
    if (!meta.length) return send(res, 404, { code: 'PGRST202', message: `função ${fn} não encontrada` });
    const values = keys.map((k) => body[k]);
    const result = await asRole(claims, async (c) => {
      if (meta[0].proretset) return (await c.query(`select * from public.${ident(fn)}(${args})`, values)).rows;
      const r = await c.query(`select public.${ident(fn)}(${args}) as v`, values);
      return r.rows[0]?.v ?? null;
    });
    return meta[0].typname === 'void' ? send(res, 204) : send(res, 200, result);
  }

  const params = [];
  const alias = 't';
  if (req.method === 'GET' || req.method === 'HEAD') {
    const sel = await selectSql(table, search.get('select') || '*', alias);
    const where = whereSql(search, params);
    const limit = search.get('limit') ? `limit ${Number(search.get('limit'))}` : '';
    const offset = search.get('offset') ? `offset ${Number(search.get('offset'))}` : '';
    const rows = await asRole(claims, async (c) => (await c.query(`select ${sel} from public.${ident(table)} ${alias} ${where} ${orderSql(search.get('order'))} ${limit} ${offset}`, params)).rows);
    const range = { 'Content-Range': `0-${Math.max(rows.length - 1, 0)}/${/count=exact/.test(prefer) ? rows.length : '*'}` };
    if (req.method === 'HEAD') return send(res, 200, undefined, range);
    if (wantsObject) {
      if (rows.length !== 1) return send(res, 406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: `The result contains ${rows.length} rows` });
      return send(res, 200, rows[0], range);
    }
    return send(res, 200, rows, range);
  }

  const returning = search.get('select') ? `returning ${(await selectSql(table, search.get('select'), table)).replaceAll(`${table}.`, '')}` : /return=representation/.test(prefer) ? 'returning *' : '';
  let sql;
  if (req.method === 'POST') {
    const body = JSON.parse((await readBody(req)).toString());
    const rows = Array.isArray(body) ? body : [body];
    const cols = Object.keys(rows[0]);
    const values = rows.map((r) => `(${cols.map((c) => `$${params.push(r[c] === undefined ? null : r[c])}`).join(', ')})`).join(', ');
    sql = `insert into public.${ident(table)} (${cols.map(ident).join(', ')}) values ${values} ${returning}`;
  } else if (req.method === 'PATCH') {
    const body = JSON.parse((await readBody(req)).toString());
    const sets = Object.keys(body).map((k) => `${ident(k)} = $${params.push(body[k])}`).join(', ');
    sql = `update public.${ident(table)} set ${sets} ${whereSql(search, params)} ${returning}`;
  } else if (req.method === 'DELETE') {
    sql = `delete from public.${ident(table)} ${whereSql(search, params)} ${returning}`;
  } else return send(res, 405, { message: 'método não suportado' });

  // Arrays JS -> arrays do Postgres (ex.: amenities text[]).
  const fixed = params.map((p) => (p && typeof p === 'object' && !Array.isArray(p) ? JSON.stringify(p) : p));
  const rows = await asRole(claims, async (c) => (await c.query(sql, fixed)).rows);
  if (!returning) return send(res, req.method === 'POST' ? 201 : 204);
  return wantsObject ? send(res, rows.length === 1 ? 200 : 406, rows[0] ?? { code: 'PGRST116', message: 'no rows' }) : send(res, 200, rows);
}

// ---------------- Storage ----------------
async function storage(req, res, url) {
  const p = decodeURIComponent(url.pathname.replace('/storage/v1/object/', ''));
  if (req.method === 'GET' && p.startsWith('public/')) {
    const file = path.join(FILES, p.slice(7));
    if (!file.startsWith(FILES) || !fs.existsSync(file)) return send(res, 404, { message: 'not found' });
    res.writeHead(200, { 'Content-Type': file.endsWith('.webp') ? 'image/webp' : 'application/octet-stream' });
    return fs.createReadStream(file).pipe(res);
  }
  const claims = claimsOf(req);
  if (req.method === 'POST') {
    const [bucket, ...rest] = p.split('/');
    const name = rest.join('/');
    const request = new Request(`http://x${url.pathname}`, { method: 'POST', headers: req.headers, body: await readBody(req) });
    let data;
    if ((req.headers['content-type'] || '').startsWith('multipart/')) {
      const form = await request.formData();
      const file = [...form.values()].find((v) => typeof v === 'object');
      data = Buffer.from(await file.arrayBuffer());
    } else data = Buffer.from(await request.arrayBuffer());
    await asRole(claims, (c) => c.query('insert into storage.objects (bucket_id, name) values ($1, $2)', [bucket, name]));
    const file = path.join(FILES, bucket, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data);
    return send(res, 200, { Key: `${bucket}/${name}`, Id: crypto.randomUUID() });
  }
  if (req.method === 'DELETE') {
    const bucket = p.replace(/\/$/, '');
    const { prefixes = [] } = JSON.parse((await readBody(req)).toString() || '{}');
    await asRole(claims, async (c) => {
      for (const name of prefixes) {
        const r = await c.query('delete from storage.objects where bucket_id = $1 and name = $2 returning name', [bucket, name]);
        if (r.rowCount) fs.rmSync(path.join(FILES, bucket, name), { force: true });
      }
    });
    return send(res, 200, prefixes.map((name) => ({ name })));
  }
  return send(res, 405, { message: 'não suportado' });
}

// ---------------- Auth ----------------
async function auth(req, res, url) {
  const route = url.pathname.replace('/auth/v1/', '');
  if (route === 'token') {
    const body = JSON.parse((await readBody(req)).toString() || '{}');
    let email;
    if (url.searchParams.get('grant_type') === 'password') {
      email = String(body.email || '').toLowerCase();
      if (!USERS[email] || USERS[email].password !== body.password) return send(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials', code: 'invalid_credentials', msg: 'Invalid login credentials' });
    } else {
      try {
        email = JSON.parse(Buffer.from(String(body.refresh_token).slice(2), 'base64url').toString()).email;
      } catch {
        return send(res, 400, { error: 'invalid_grant', msg: 'Invalid Refresh Token' });
      }
    }
    return send(res, 200, session(email));
  }
  if (route === 'user') {
    const claims = claimsOf(req);
    return claims ? send(res, 200, userObj(claims.email)) : send(res, 401, { code: 401, msg: 'invalid JWT', error_code: 'bad_jwt' });
  }
  if (route === 'logout') return send(res, 204);
  return send(res, 404, { msg: 'rota de auth não suportada' });
}

http
  .createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,HEAD,OPTIONS');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    if (req.method === 'OPTIONS') return send(res, 204);
    const url = new URL(req.url, `http://${req.headers.host}`);
    try {
      if (url.pathname.startsWith('/rest/v1/')) return await rest(req, res, url, url.pathname.slice(9));
      if (url.pathname.startsWith('/auth/v1/')) return await auth(req, res, url);
      if (url.pathname.startsWith('/storage/v1/object/')) return await storage(req, res, url);
      send(res, 404, { message: 'not found' });
    } catch (e) {
      if (process.env.DEBUG) console.error(req.method, req.url, e.message);
      pgError(res, e);
    }
  })
  .listen(PORT, () => console.log(`Supabase de teste em http://127.0.0.1:${PORT}`));
