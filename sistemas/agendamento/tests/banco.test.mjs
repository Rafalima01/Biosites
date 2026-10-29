// Testes das regras do banco, num Postgres de verdade rodando dentro do Node (PGlite):
// não precisa instalar Postgres nem Docker. Uso: npm run test:db
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const file = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const LIVIA = 'a0000000-0000-4000-8000-000000000001';
const ALONGAMENTO = 'b0000000-0000-4000-8000-000000000001'; // 120 min
const DESIGN = 'b0000000-0000-4000-8000-000000000004'; // 40 min

let falhas = 0;
let total = 0;
const ok = (cond, msg) => {
  total++;
  if (cond) console.log(`ok - ${msg}`);
  else {
    falhas++;
    console.log(`FALHOU - ${msg}`);
  }
};
const one = async (sql, params = []) => (await db.query(sql, params)).rows[0];
const all = async (sql, params = []) => (await db.query(sql, params)).rows;
const as = async (role, email) => {
  await db.exec('reset role');
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [email ? JSON.stringify({ email }) : '']);
  if (role) await db.exec(`set role ${role}`);
};
const somaDia = (dia, n) => {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const throws = async (fn) => {
  try {
    await fn();
    return false;
  } catch {
    return true;
  }
};

// Instala como no Supabase (e roda o schema duas vezes: não pode quebrar).
await db.exec(file('tests/supabase-stub.sql'));
await db.exec(file('supabase/schema.sql'));
await db.exec(file('supabase/seed.sql'));
await db.exec(file('supabase/schema.sql'));
await db.exec(file('supabase/seed.sql'));

// Segundo studio e logins
await db.exec(`
  insert into studios (id, slug, name, settings) values ('a0000000-0000-4000-8000-000000000002', 'outro-studio', 'Outro Studio', '{"depositPercent": 0}');
  insert into services (id, studio_id, name, minutes, price) values ('b0000000-0000-4000-8000-000000000099', 'a0000000-0000-4000-8000-000000000002', 'Corte', 30, 50);
  insert into hours (studio_id, weekday, starts, ends) select 'a0000000-0000-4000-8000-000000000002', d, '10:00', '12:00' from generate_series(0, 6) d;
  insert into studio_members (studio_id, email) values ('${LIVIA}', 'livia@ex.com'), ('a0000000-0000-4000-8000-000000000002', 'outra@ex.com');
  insert into agency_admins (email) values ('agencia@ex.com');
`);

// Próxima segunda-feira com pelo menos 7 dias de folga (dentro da janela de 30 dias), no fuso do studio.
const { seg } = await one(`
  select (d + ((8 - extract(isodow from d)::int) % 7))::date::text as seg
  from (select ((now() at time zone 'America/Sao_Paulo')::date + 7) as d) x`);

// ---------------- visitante ----------------
await as('anon');
const pub = (await one(`select public_studio('studio-livia') as j`)).j;
ok(pub.name === 'Studio Lívia Beauty' && pub.services.length === 7, 'visitante vê o studio e os 7 serviços');
ok(pub.pix.key === '+5500900000000' && Number(pub.depositPercent) === 30, 'visitante vê a chave Pix e o percentual do sinal');
ok(JSON.stringify(pub).indexOf('@ex.com') < 0, 'dados públicos não trazem e-mails');

let slots = await all(`select slot, starts_at, free from day_slots('studio-livia', $1, $2::date)`, [DESIGN, seg]);
ok(slots[0].slot === '09:00' && slots.every((s) => s.free), 'segunda começa às 09:00 e está toda livre');
ok(!slots.some((s) => s.slot === '11:30') && slots.some((s) => s.slot === '11:00'), 'serviço de 40 min não começa 11:30 (passaria do almoço)');
ok(!slots.some((s) => s.slot === '12:00' || s.slot === '12:30'), 'almoço (12h–13h) sem horários');
ok(new Date(slots[0].starts_at).toISOString().slice(11, 16) === '12:00', '09:00 em Salvador = 12:00 UTC');
const domingo = new Date(`${seg}T12:00:00Z`);
domingo.setUTCDate(domingo.getUTCDate() - 1);
ok((await all(`select * from day_slots('studio-livia', $1, $2::date)`, [DESIGN, domingo.toISOString().slice(0, 10)])).length === 0, 'domingo fechado');
ok((await all(`select * from day_slots('studio-livia', $1, current_date + 60)`, [DESIGN])).length === 0, 'não agenda além de 30 dias');
ok((await all(`select * from day_slots('studio-livia', $1, current_date - 1)`, [DESIGN])).length === 0, 'não agenda no passado');

const slot10 = slots.find((s) => s.slot === '10:00').starts_at;
let r = (await one(`select book('studio-livia', $1, $2, 'Ana Souza', '(71) 99999-0001', 'primeira vez') as j`, [ALONGAMENTO, slot10])).j;
ok(r.ok && r.status === 'pending', 'cliente agenda alongamento às 10:00 (aguardando sinal)');
ok(Number(r.price) === 150 && Number(r.deposit) === 45, 'valor vem do serviço e sinal é 30% (R$ 45)');
const code = r.code;

r = (await one(`select book('studio-livia', $1, $2, 'Bia Lima', '(71) 98888-0002') as j`, [DESIGN, slot10])).j;
ok(!r.ok, 'outra cliente NÃO consegue o mesmo horário');
const s11 = new Date(new Date(slot10).getTime() + 60 * 60000).toISOString();
r = (await one(`select book('studio-livia', $1, $2, 'Bia Lima', '(71) 98888-0002') as j`, [DESIGN, s11])).j;
ok(!r.ok, 'nem um horário que encosta no alongamento (10:00–12:00)');

slots = await all(`select slot, free from day_slots('studio-livia', $1, $2::date)`, [DESIGN, seg]);
const mapa = Object.fromEntries(slots.map((s) => [s.slot, s.free]));
ok(mapa['09:00'] && mapa['09:30'] === false && mapa['10:00'] === false && mapa['11:00'] === false, 'ocupados aparecem com free = false');
ok(mapa['13:00'] === true, 'tarde continua livre');

const s13 = (await one(`select starts_at from day_slots('studio-livia', $1, $2::date) where slot = '13:00'`, [DESIGN, seg])).starts_at;
r = (await one(`select book('studio-livia', $1, $2, 'Ana', '(71) 96666-0004') as j`, [DESIGN, s13])).j;
ok(!r.ok, 'exige nome e sobrenome');
r = (await one(`select book('studio-livia', $1, now() + interval '3 days', 'Carla Dias', '123') as j`, [DESIGN])).j;
ok(!r.ok, 'exige WhatsApp válido');
r = (await one(`select book('studio-livia', $1, $2, 'Carla Dias', '(71) 97777-0003') as j`, [DESIGN, new Date(new Date(slot10).getTime() + 17 * 60000).toISOString()])).j;
ok(!r.ok, 'não aceita horário "quebrado" fora da grade (10:17)');

const g = (await one(`select get_appointment($1) as j`, [code.toLowerCase()])).j;
ok(g.status === 'pending' && g.clientName === 'Ana' && g.phone === undefined, 'consulta pelo código mostra só o primeiro nome, sem telefone');
ok((await one(`select count(*)::int as n from appointments`)).n === 0, 'visitante NÃO lê a tabela de agendamentos');
ok((await one(`select count(*)::int as n from blocks`)).n === 0, 'visitante NÃO lê bloqueios');
ok(await throws(() => db.query(`select set_appointment_status(gen_random_uuid(), 'confirmed')`)), 'visitante não muda status');
ok(await throws(() => db.query(`insert into blocks (studio_id, starts_at, ends_at) values ($1, now(), now() + interval '1 hour')`, [LIVIA])), 'visitante não cria bloqueio');

// ---------------- dona do studio ----------------
await as('authenticated', 'livia@ex.com');
const minhas = await all(`select * from appointments where code = $1`, [code]);
ok(minhas.length === 1 && minhas[0].client_phone.includes('99999'), 'dona vê o agendamento com o telefone');
await db.query(`select set_appointment_status($1, 'confirmed')`, [minhas[0].id]);
ok((await one(`select status from appointments where id = $1`, [minhas[0].id])).status === 'confirmed', 'dona confirma o sinal');

const tarde = (await one(`select starts_at from day_slots('studio-livia', $1, $2::date) where slot = '15:00'`, [DESIGN, seg])).starts_at;
await db.query(`insert into blocks (studio_id, starts_at, ends_at, reason) values ($1, $2, $2::timestamptz + interval '2 hours', 'Médico')`, [LIVIA, tarde]);
slots = await all(`select slot, free from day_slots('studio-livia', $1, $2::date)`, [DESIGN, seg]);
ok(!slots.find((s) => s.slot === '15:00').free && !slots.find((s) => s.slot === '16:30').free && slots.find((s) => s.slot === '17:00').free, 'bloqueio das 15h às 17h tira esses horários');

r = (await one(`select add_appointment($1, $2, $3, 'Dona Maria', '', 'encaixe') as j`, [LIVIA, DESIGN, tarde])).j;
ok(!r.ok, 'encaixe não pode bater com bloqueio');
const noite = new Date(new Date(tarde).getTime() + 5 * 3600000).toISOString(); // 20:00, fora do expediente
r = (await one(`select add_appointment($1, $2, $3, 'Dona Maria') as j`, [LIVIA, DESIGN, noite])).j;
ok(r.ok, 'encaixe fora do expediente é permitido para a dona');

await db.query(`select set_appointment_status($1, 'cancelled')`, [minhas[0].id]);
slots = await all(`select slot, free from day_slots('studio-livia', $1, $2::date)`, [DESIGN, seg]);
ok(slots.find((s) => s.slot === '10:00').free, 'cancelar libera o horário');

// Outra cliente pega o horário liberado; reativar o cancelado precisa falhar.
await as('anon');
r = (await one(`select book('studio-livia', $1, $2, 'Bia Lima', '(71) 98888-0002') as j`, [DESIGN, slot10])).j;
ok(r.ok, 'horário liberado pode ser agendado por outra cliente');
await as('authenticated', 'livia@ex.com');
ok(await throws(() => db.query(`select set_appointment_status($1, 'confirmed')`, [minhas[0].id])), 'não reativa cancelado se o horário já foi ocupado');

// Expiração do sinal
await as(null);
await db.exec(`update appointments set expires_at = now() - interval '1 minute' where client_name = 'Bia Lima'`);
await as('anon');
slots = await all(`select slot, free from day_slots('studio-livia', $1, $2::date)`, [DESIGN, seg]);
ok(slots.find((s) => s.slot === '10:00').free, 'sinal não pago no prazo libera o horário sozinho');

// ---------------- isolamento entre studios ----------------
await as('authenticated', 'outra@ex.com');
ok((await one(`select count(*)::int as n from appointments`)).n === 0, 'dona de outro studio NÃO vê os agendamentos da Lívia');
ok((await one(`select count(*)::int as n from blocks`)).n === 0, 'nem os bloqueios');
const qualquer = (await all(`select id from services where studio_id = $1 limit 1`, [LIVIA]))[0];
ok(await throws(() => db.query(`select add_appointment($1, $2, now() + interval '1 day', 'Intrusa')`, [LIVIA, qualquer.id])), 'não cria agendamento no studio dos outros');
await db.query(`update services set price = 1 where studio_id = $1`, [LIVIA]);
await as(null);
ok(Number((await one(`select price from services where id = $1`, [DESIGN])).price) === 35, 'não altera preço do studio dos outros');

await as('anon');
const outro = await all(`select slot, starts_at from day_slots('outro-studio', 'b0000000-0000-4000-8000-000000000099', $1::date)`, [seg]);
r = (await one(`select book('outro-studio', 'b0000000-0000-4000-8000-000000000099', $1, 'Duda Rocha', '(11) 91234-5678') as j`, [outro[0].starts_at])).j;
ok(r.ok && r.status === 'confirmed' && Number(r.deposit) === 0, 'studio sem sinal confirma direto');
r = (await one(`select book('studio-livia', 'b0000000-0000-4000-8000-000000000099', $1, 'Duda Rocha', '(11) 91234-5678') as j`, [outro[1].starts_at])).j;
ok(!r.ok, 'serviço de um studio não pode ser agendado em outro');

// ---------------- clientes (cadastro pelo WhatsApp) ----------------
await as('anon');
let fc = (await one(`select find_client('studio-livia', '(71) 97000-1111') as j`)).j;
ok(fc.ok && fc.found === false, 'WhatsApp novo: não tem cadastro');
ok(!(await one(`select find_client('studio-livia', '123') as j`)).j.ok, 'WhatsApp inválido é recusado');
const sCli = (await one(`select starts_at from day_slots('studio-livia', $1, $2::date) where slot = '14:00'`, [DESIGN, seg])).starts_at;
r = (await one(`select book('studio-livia', $1, $2, '', '(71) 97000-1111') as j`, [DESIGN, sCli])).j;
ok(!r.ok && r.needName === true, 'cliente nova sem nome: pede o nome');
r = (await one(`select book('studio-livia', $1, $2, 'Karla  Nunes', '(71) 97000-1111') as j`, [DESIGN, sCli])).j;
ok(r.ok && r.firstName === 'Karla', 'cliente nova agenda e fica cadastrada');
fc = (await one(`select find_client('studio-livia', '5571970001111') as j`)).j;
ok(fc.found === true && fc.firstName === 'Karla' && fc.name === undefined && fc.phone === undefined, 'na volta é reconhecida (com ou sem 55), só pelo primeiro nome');
ok((await one(`select find_client('outro-studio', '71970001111') as j`)).j.found === false, 'cadastro é por studio');
const sCli2 = (await one(`select starts_at from day_slots('studio-livia', $1, $2::date) where slot = '15:30'`, [ALONGAMENTO, somaDia(seg, 1)])).starts_at;
r = (await one(`select book('studio-livia', $1, $2, 'Outro Nome Qualquer', '71970001111') as j`, [ALONGAMENTO, sCli2])).j;
ok(r.ok && r.firstName === 'Karla', 'cliente cadastrada agenda sem nome e ninguém troca o nome dela pelo site');
ok((await one('select count(*)::int as n from clients')).n === 0, 'site não lê a lista de clientes');
await as('authenticated', 'livia@ex.com');
const karla = await all(`select c.name, c.phone, count(a.id)::int as ags from clients c join appointments a on a.client_id = c.id where c.phone = '71970001111' group by c.id`);
ok(karla.length === 1 && karla[0].name === 'Karla Nunes' && karla[0].ags === 2, 'dona vê a cliente com os 2 agendamentos ligados');
ok((await one('select count(*)::int as n from clients where studio_id = $1', [LIVIA])).n === 3, 'dona vê as clientes do studio (Ana, Bia e Karla)');
await as(null);
await db.query(`insert into appointments (code, studio_id, service_name, starts_at, ends_at, client_name, client_phone, price, status, source) values ('ANTIGO1', $1, 'Design', now() + interval '9 days', now() + interval '9 days 1 hour', 'Lara Antiga', '(71) 96000-2222', 35, 'confirmed', 'painel')`, [LIVIA]);
await db.exec(file('supabase/schema.sql'));
ok((await one(`select c.name from appointments a join clients c on c.id = a.client_id where a.code = 'ANTIGO1'`))?.name === 'Lara Antiga', 'agendamentos de antes do cadastro viram clientes ao atualizar o banco');
await as('authenticated', 'livia@ex.com');
r = (await one(`select add_appointment($1, $2, now() + interval '5 days', '', '(71) 97000-1111') as j`, [LIVIA, DESIGN])).j;
ok(r.ok, 'encaixe pelo WhatsApp de cliente cadastrada dispensa o nome');
await as('authenticated', 'outra@ex.com');
ok((await one('select count(*)::int as n from clients where studio_id = $1', [LIVIA])).n === 0, 'dona de outro studio não vê as clientes da Lívia');

// ---------------- avisos (push) ----------------
await as(null);
const chamadas = async () => (await one('select count(*)::int as n from net._chamadas')).n;
await db.exec('delete from net._chamadas');
await db.query(`insert into push_subscriptions (studio_id, email, endpoint, p256dh, auth) values ($1, 'livia@ex.com', 'https://push.exemplo/cel-1', 'k', 'a')`, [LIVIA]);
await as('anon');
const sNovo = (await one(`select starts_at from day_slots('studio-livia', $1, $2::date) where slot = '17:00'`, [DESIGN, seg])).starts_at;
r = (await one(`select book('studio-livia', $1, $2, 'Fernanda Alves', '(71) 95555-0005') as j`, [DESIGN, sNovo])).j;
await as(null);
ok(r.ok && (await chamadas()) === 0, 'sem configuração de envio, agenda normalmente e não chama ninguém');
await db.exec(`insert into app_config (key, value) values ('push_url', 'https://painel.exemplo/api/push'), ('push_secret', 'segredo-teste') on conflict (key) do update set value = excluded.value`);
await as('anon');
const sNovo2 = (await one(`select starts_at from day_slots('studio-livia', $1, $2::date) where slot = '18:00'`, [DESIGN, seg])).starts_at;
r = (await one(`select book('studio-livia', $1, $2, 'Gabi Torres', '(71) 94444-0006') as j`, [DESIGN, sNovo2])).j;
await as(null);
let c = await all('select * from net._chamadas order by id');
ok(r.ok && c.length === 1, 'agendamento pelo site dispara 1 aviso');
ok(c[0]?.body.title.includes('aguardando sinal') && c[0]?.body.body.startsWith('Gabi · Design personalizado') && c[0]?.body.url === '/pedidos', 'aviso diz quem, o quê e quando, e abre Aguardando sinal');
ok(c[0]?.headers['x-push-secret'] === 'segredo-teste' && c[0]?.body.subscriptions.length === 1 && c[0]?.url === 'https://painel.exemplo/api/push', 'aviso vai com o segredo para os celulares do studio');
await as('authenticated', 'livia@ex.com');
await db.query(`select add_appointment($1, $2, now() + interval '3 days', 'Encaixe Teste')`, [LIVIA, DESIGN]);
await as(null);
ok((await chamadas()) === 1, 'encaixe feito pela dona não gera aviso');
await db.exec('delete from net._chamadas');
await db.query(
  `insert into appointments (code, studio_id, service_id, service_name, starts_at, ends_at, client_name, client_phone, price, status, source) values
  ('LEMB001', $1, $2, 'Design personalizado', now() + interval '20 minutes', now() + interval '60 minutes', 'Helena Prado', '71933330007', 35, 'confirmed', 'painel'),
  ('LEMB002', $1, $2, 'Design personalizado', now() + interval '2 hours', now() + interval '3 hours', 'Iris Melo', '71922220008', 35, 'confirmed', 'painel'),
  ('LEMB003', $1, $2, 'Design personalizado', now() + interval '10 minutes', now() + interval '50 minutes', 'Joana Reis', '71911110009', 35, 'cancelled', 'painel')`,
  [LIVIA, DESIGN],
);
ok((await one('select send_reminders() as n')).n === 1, 'lembrete só para o confirmado que começa em até 30 min');
c = await all('select body from net._chamadas');
ok(/^Daqui a (19|20) min: Helena às /.test(c[0]?.body.title || ''), 'lembrete diz quanto falta, quem e a hora');
ok((await one('select send_reminders() as n')).n === 0, 'o mesmo atendimento não é lembrado duas vezes');
await as('anon');
ok((await one('select count(*)::int as n from push_subscriptions')).n === 0 && (await one('select count(*)::int as n from app_config')).n === 0, 'site não lê celulares inscritos nem o segredo');
ok(await throws(() => db.query('select send_reminders()')), 'site não dispara lembretes');
ok(await throws(() => db.query(`select push_remove('errado', array['https://push.exemplo/cel-1'])`)), 'remover celular exige o segredo');
ok((await one(`select push_remove('segredo-teste', array['https://push.exemplo/cel-1']) as n`)).n === 1, 'com o segredo, celular desinstalado sai da lista');
await as('authenticated', 'outra@ex.com');
ok(await throws(() => db.query(`insert into push_subscriptions (studio_id, endpoint, p256dh, auth) values ($1, 'https://x/y', 'k', 'a')`, [LIVIA])), 'dona de outro studio não inscreve celular no studio da Lívia');

// ---------------- agência ----------------
await as('authenticated', 'agencia@ex.com');
ok((await one(`select count(*)::int as n from appointments`)).n >= 3, 'agência vê todos os studios');
ok((await one(`select ping() as p`)).p.startsWith('ok:'), 'ping do despertador responde');

// ---------------- convites de cadastro ----------------
ok(await throws(() => db.query(`select novo_convite('outro-studio')`)), 'nem a agência pelo login gera convite (só no SQL Editor)');
await as(null);
const link = (await one(`select novo_convite('outro-studio') as l`)).l;
ok(/\/convite\/[0-9a-f]{64}$/.test(link), 'convite devolve link com código longo');
ok(await throws(() => db.query(`select novo_convite('nao-existe')`)), 'convite para studio inexistente dá erro');
await as('anon');
ok((await one('select count(*)::int as n from invites')).n === 0, 'site não lê convites');
await as('authenticated', 'outra@ex.com');
ok((await one('select count(*)::int as n from invites')).n === 0, 'login comum não lê convites');

console.log(`\n${total - falhas}/${total} verificações passaram.`);
process.exit(falhas ? 1 : 0);
