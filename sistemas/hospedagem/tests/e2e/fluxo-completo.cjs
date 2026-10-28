// Teste de ponta a ponta no navegador (Playwright). Rode num banco recém-criado (tests/dev-up.sh)
// com o app em http://localhost:3100 ou APP_URL. Uso: node tests/e2e/fluxo-completo.cjs [pasta-dos-prints]
const { chromium } = require('playwright');
const S = process.argv[2] || require('os').tmpdir();
const B = process.env.APP_URL || 'http://localhost:3100';
const log = (ok, msg) => { console.log(`${ok ? 'ok' : 'FALHOU'} - ${msg}`); if (!ok) process.exitCode = 1; };
const zlib = require('zlib');
function png(w, h) { // PNG sólido azul, gerado na hora
  const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let x = 0xffffffff; for (const v of b) x = t[(x ^ v) & 255] ^ (x >>> 8); return (x ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = 30; raw[o + 1] = 120; raw[o + 2] = 150; }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

(async () => {
  const b = await chromium.launch();
  const guest = await b.newContext({ viewport: { width: 390, height: 844 } });
  await guest.route(/unsplash|fonts\.g/, (r) => r.abort());
  const g = await guest.newPage();
  const errs = [];
  g.on('pageerror', (e) => errs.push(e.message));
  g.on('console', (m) => m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text()) && errs.push(m.text()));

  // 1) Hóspede reserva
  await g.goto(B + '/', { waitUntil: 'networkidle' });
  await g.click('.chip:has-text("Casa Areia")');
  await g.click('[aria-label="Próximo mês"]');
  await g.waitForTimeout(300);
  const free = await g.$$eval('button.day', (bs) => bs.filter((x) => /day--(free|high|promo)/.test(x.className)).map((x) => x.getAttribute('aria-label')));
  // procura 3 noites seguidas livres
  const days = await g.$$eval('button.day', (bs) => bs.map((x) => ({ l: x.getAttribute('aria-label'), c: x.className, t: x.querySelector('b').textContent })));
  let idx = -1;
  for (let i = 0; i < days.length - 3; i++) if ([0, 1, 2].every((k) => /day--(free|high|promo)/.test(days[i + k].c)) && +days[i + 3].t === +days[i].t + 3) { idx = i; break; }
  const btns = await g.$$('button.day');
  await btns[idx].click();
  await btns[idx + 3].click();
  const total = await g.textContent('.breakdown__total dd');
  log(Boolean(total), `orçamento local mostrado: ${total}`);
  await g.click('button:has-text("Continuar")');
  await g.waitForSelector('.guest-form');
  const deposit = await g.textContent('.breakdown__deposit dd');
  log(Boolean(deposit), `sinal oficial do banco: ${deposit}`);
  await g.fill('input[autocomplete="name"]', 'Carla Teste');
  await g.fill('input[type="tel"]', '(71) 98888-7777');
  await g.click('button:has-text("Reservar agora")');
  await g.waitForTimeout(400);
  log(await g.isVisible('.form-error:has-text("aceite")'), 'exige aceitar as condições');
  await g.check('.check input');
  await g.click('button:has-text("Reservar agora")');
  await g.waitForURL(/\/reserva\//, { timeout: 15000 });
  const code = g.url().split('/').pop();
  log(/^[A-Z0-9]{8}$/.test(code), `reserva criada com código ${code}`);
  log(await g.isVisible('text=Datas reservadas para você'), 'página da reserva: aguardando pagamento');
  log(await g.isVisible('text=ainda não cadastrou a chave Pix'), 'sem chave Pix: orienta a pedir no WhatsApp');
  await g.screenshot({ path: `${S}/e2e-1-reserva-sem-pix.png`, fullPage: true });

  // 2) Mesmo período fica ocupado para outro hóspede
  await g.goto(B + '/', { waitUntil: 'networkidle' });
  await g.click('.chip:has-text("Casa Areia")');
  await g.click('[aria-label="Próximo mês"]');
  await g.waitForTimeout(500);
  const after = await g.$$eval('button.day', (bs) => bs.map((x) => x.className));
  log(/day--booked/.test(after[idx]) && /day--booked/.test(after[idx + 2]), 'datas reservadas aparecem como ocupadas na agenda');

  // 3) Anfitrião
  const host = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await host.route(/unsplash|fonts\.g/, (r) => r.abort());
  const a = await host.newPage();
  a.on('pageerror', (e) => errs.push('admin: ' + e.message));
  a.on('dialog', (d) => d.accept());
  await a.goto(B + '/admin/login');
  await a.fill('input[type="email"]', 'dono@ex.com');
  await a.fill('input[type="password"]', 'errada');
  await a.click('button[type="submit"]');
  log(await a.waitForSelector('.form-error', { timeout: 5000 }).then(() => true, () => false), 'senha errada é recusada');
  await a.fill('input[type="password"]', 'senha123');
  await a.click('button[type="submit"]');
  await a.waitForURL(B + '/admin', { timeout: 15000 });
  await a.waitForSelector('.kpis');
  const pendingKpi = await a.textContent('.kpi--warn strong');
  log(pendingKpi.trim() === '1', `dashboard: ${pendingKpi.trim()} reserva aguardando Pix`);
  await a.screenshot({ path: `${S}/e2e-2-dashboard.png`, fullPage: true });

  // Configura Pix e WhatsApp
  await a.goto(B + '/admin/configuracoes');
  await a.fill('input[name="booking.pixKey"]', 'contato@maremansa.com.br');
  await a.fill('input[name="booking.pixName"]', 'Maré Mansa Temporada');
  await a.fill('input[name="booking.pixCity"]', 'Mata de São João');
  await a.fill('input[name="contact.whatsapp"]', '5571999990000');
  await a.click('button:has-text("Salvar configurações")');
  log(await a.waitForSelector('.notice--ok', { timeout: 10000 }).then(() => true, () => false), 'configurações salvas');
  await g.goto(`${B}/reserva/${code}`, { waitUntil: 'networkidle' });
  log(await g.isVisible('.pix__qr svg'), 'página da reserva mostra QR Code Pix');
  await g.screenshot({ path: `${S}/e2e-3-reserva-pix.png`, fullPage: true });

  // Confirma a reserva
  await a.goto(B + '/admin/reservas');
  await a.click('button:has-text("Confirmar Pix")');
  await a.waitForTimeout(1500);
  await a.goto(B + '/admin/reservas?status=confirmed');
  log(await a.isVisible(`text=${code}`), 'reserva aparece em Confirmadas');
  await a.screenshot({ path: `${S}/e2e-4-reservas.png`, fullPage: true });
  await g.goto(`${B}/reserva/${code}`, { waitUntil: 'networkidle' });
  log(await g.isVisible('text=Reserva confirmada'), 'hóspede vê a reserva confirmada');

  // Nova casa com foto
  await a.goto(B + '/admin/casas/nova');
  await a.fill('input[name="name"]', 'Casa Teste Sol');
  await a.fill('input[name="location"]', 'Arembepe, Bahia');
  await a.fill('input[name="price"]', '500');
  await a.fill('input[name="guests"]', '6');
  await a.fill('textarea[name="amenities"]', 'Piscina\nWi-Fi');
  await a.click('button:has-text("Criar casa")');
  await a.waitForURL(/\/admin\/casas\/[0-9a-f-]{36}\?nova=1/, { timeout: 15000 });
  log(true, 'casa criada e aberta para fotos');
  await a.setInputFiles('.dropzone input', { name: 'piscina.png', mimeType: 'image/png', buffer: png(64, 48) });
  await a.waitForSelector('.photos__grid .photo img', { timeout: 15000 }).catch(() => {});
  log(await a.isVisible('.photos__grid .photo img'), 'foto enviada e listada');
  await a.screenshot({ path: `${S}/e2e-5-casa.png`, fullPage: true });
  const houseUrl = a.url();

  // Promoção, pacote e bloqueio para a casa nova
  const now = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const d = (n) => { const x = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + n)); return iso(x); };
  await a.goto(B + '/admin/promocoes');
  await a.fill('input[name="label"]', 'Promo teste');
  await a.selectOption('select[name="house_id"]', { label: 'Casa Teste Sol' });
  await a.fill('input[name="starts_on"]', d(35));
  await a.fill('input[name="ends_on"]', d(40));
  await a.fill('input[name="value"]', '30');
  await a.click('button:has-text("Criar promoção")');
  log(await a.waitForSelector('.notice--ok', { timeout: 10000 }).then(() => true, () => false), 'promoção criada');
  await a.goto(B + '/admin/pacotes');
  await a.fill('input[name="title"]', 'Feriadão teste');
  await a.fill('input[name="tag"]', 'Feriado');
  await a.selectOption('select[name="house_id"]', { label: 'Casa Teste Sol' });
  await a.fill('input[name="starts_on"]', d(50));
  await a.fill('input[name="ends_on"]', d(53));
  await a.fill('input[name="price"]', '1800');
  await a.click('button:has-text("Criar pacote")');
  log(await a.waitForSelector('.notice--ok', { timeout: 10000 }).then(() => true, () => false), 'pacote criado');
  const houseId = houseUrl.match(/casas\/([0-9a-f-]{36})/)[1];
  await a.goto(`${B}/admin/agenda?casa=${houseId}`);
  await a.fill('input[name="starts_on"]', d(20));
  await a.fill('input[name="ends_on"]', d(23));
  await a.fill('input[name="reason"]', 'Reserva Airbnb');
  await a.click('button:has-text("Bloquear")');
  log(await a.waitForSelector('.notice--ok', { timeout: 10000 }).then(() => true, () => false), 'datas bloqueadas');
  await a.goto(`${B}/admin/agenda?casa=${houseId}&mes=${d(20).slice(0, 7)}`);
  log(await a.isVisible('.acal__day--block'), 'bloqueio aparece na agenda do anfitrião');
  await a.screenshot({ path: `${S}/e2e-6-agenda.png`, fullPage: true });

  // Site reflete tudo
  await g.goto(B + '/', { waitUntil: 'networkidle' });
  log(await g.isVisible('.house-card__name:has-text("Casa Teste Sol")'), 'casa nova aparece no site');
  log(await g.isVisible('.package__title:has-text("Feriadão teste")'), 'pacote novo aparece no site');
  await g.click('.chip:has-text("Casa Teste Sol")');
  const statuses = new Set();
  for (let i = 0; i < 3; i++) {
    (await g.$$eval('button.day', (bs) => bs.map((x) => x.className))).forEach((c) => statuses.add(c.match(/day--(\w+)/)[1]));
    await g.click('[aria-label="Próximo mês"]');
    await g.waitForTimeout(400);
  }
  log(statuses.has('promo') && statuses.has('package') && statuses.has('booked'), `agenda pública mostra promoção, pacote e bloqueio (${[...statuses].join(', ')})`);

  // Intruso
  const intr = await (await b.newContext()).newPage();
  await intr.goto(B + '/admin/login');
  await intr.fill('input[type="email"]', 'intruso@ex.com');
  await intr.fill('input[type="password"]', 'senha123');
  await intr.click('button[type="submit"]');
  await intr.waitForURL(B + '/admin', { timeout: 15000 });
  log(await intr.isVisible('text=Acesso não liberado'), 'usuário sem permissão é barrado no painel');

  log(errs.length === 0, `sem erros de JavaScript${errs.length ? ': ' + errs.join(' | ') : ''}`);
  await b.close();
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
