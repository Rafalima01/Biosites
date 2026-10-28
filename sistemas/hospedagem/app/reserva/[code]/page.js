import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { supabaseServer } from '@/lib/supabase/server';
import { loadSettings } from '@/lib/settings';
import { formatDate } from '@/lib/dates';
import { brl, plural, whatsappUrl } from '@/lib/format';
import { pixPayload } from '@/lib/pix';
import { Icon, LogoMark } from '@/components/Icon';
import { Theme } from '@/components/site/Theme';
import { CopyButton } from './CopyButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sua reserva', robots: { index: false } };

const STATUS = {
  pending: { icon: 'clock', title: 'Datas reservadas para você!', tone: 'pending' },
  confirmed: { icon: 'check', title: 'Reserva confirmada', tone: 'ok' },
  expired: { icon: 'clock', title: 'O prazo de pagamento terminou', tone: 'off' },
  cancelled: { icon: 'close', title: 'Reserva cancelada', tone: 'off' },
};

export default async function BookingPage({ params }) {
  const { code } = await params;
  const supabase = await supabaseServer();
  const [{ data: b }, settings] = await Promise.all([supabase.rpc('get_booking', { p_code: code }), loadSettings(supabase)]);
  if (!b) notFound();

  const s = STATUS[b.status] || STATUS.pending;
  const pay = settings.booking;
  const pix = b.status === 'pending' ? pixPayload({ key: pay.pixKey, name: pay.pixName, city: pay.pixCity, amount: b.deposit, txid: b.code }) : '';
  const qr = pix ? await QRCode.toString(pix, { type: 'svg', margin: 1, width: 220, color: { dark: '#14303a', light: '#ffffff' } }) : '';
  const expires = b.expiresAt
    ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(b.expiresAt))
    : '';
  const wa = whatsappUrl(
    settings.contact.whatsapp,
    b.status === 'pending'
      ? `Olá! Segue o comprovante do sinal da reserva ${b.code} (${b.house}, ${formatDate(b.checkIn)} a ${formatDate(b.checkOut)}).`
      : `Olá! Tenho uma dúvida sobre a reserva ${b.code}.`,
  );

  return (
    <>
      <Theme theme={settings.theme} />
      <div className="page">
        <header className="topbar">
          <a className="topbar__brand" href="/">
            <LogoMark size={34} />
            <span><strong>{settings.brand.name}</strong><small>{settings.brand.tagline}</small></span>
          </a>
        </header>
        <main className="receipt">
          <section className={`receipt__status receipt__status--${s.tone}`}>
            <span className="receipt__icon"><Icon name={s.icon} size={28} /></span>
            <p className="eyebrow">Reserva {b.code}</p>
            <h1 className="section__title">{s.title}</h1>
            {b.status === 'pending' ? (
              <p>Olá, {b.guestName}! Para confirmar, pague o sinal de <strong>{brl(b.deposit)}</strong> via Pix até <strong>{expires}</strong>. Depois disso as datas são liberadas.</p>
            ) : b.status === 'confirmed' ? (
              <p>Tudo certo, {b.guestName}! Pagamento do sinal confirmado. Até breve!</p>
            ) : b.status === 'expired' ? (
              <p>O sinal não foi confirmado a tempo e as datas foram liberadas. Se ainda quiser se hospedar, faça uma nova reserva ou fale conosco.</p>
            ) : (
              <p>Esta reserva foi cancelada. Em caso de dúvida, fale conosco.</p>
            )}
          </section>

          {b.status === 'pending' ? (
            <section className="receipt__card">
              <h2 className="receipt__title"><Icon name="lock" size={20} />Pague o sinal via Pix</h2>
              {pix ? (
                <>
                  <div className="pix">
                    <div className="pix__qr" dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label="QR Code Pix" />
                    <div className="pix__info">
                      <p>Abra o app do seu banco, escolha <strong>Pix → Ler QR Code</strong> ou use o <strong>copia e cola</strong>. O valor já vem preenchido.</p>
                      <dl className="rates">
                        <div><dt>Valor do sinal</dt><dd>{brl(b.deposit)}</dd></div>
                        <div><dt>Recebedor</dt><dd>{pay.pixName}</dd></div>
                      </dl>
                    </div>
                  </div>
                  <CopyButton text={pix} label="Copiar Pix copia e cola" />
                  <p className="receipt__small">Chave Pix: {pay.pixKey}{pay.pixBank ? ` · ${pay.pixBank}` : ''}</p>
                </>
              ) : (
                <p className="receipt__small">O anfitrião ainda não cadastrou a chave Pix. Fale pelo WhatsApp para receber os dados de pagamento.</p>
              )}
              {wa ? <a className="btn btn--primary btn--block" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={20} />Enviar comprovante no WhatsApp</a> : null}
            </section>
          ) : null}

          <section className="receipt__card">
            <h2 className="receipt__title"><Icon name="home" size={20} />{b.house}{b.package ? ` · ${b.package}` : ''}</h2>
            <div className="summary__dates">
              <div><span>Entrada</span><strong>{formatDate(b.checkIn)}{pay.checkInTime ? ` · ${pay.checkInTime}` : ''}</strong></div>
              <div><span>Saída</span><strong>{formatDate(b.checkOut)}{pay.checkOutTime ? ` · ${pay.checkOutTime}` : ''}</strong></div>
            </div>
            <dl className="breakdown">
              <div><dt>{plural(b.nights, 'noite', 'noites')} · {plural(b.guests, 'hóspede', 'hóspedes')}</dt><dd>{brl(b.lodging)}</dd></div>
              {Number(b.cleaning) > 0 ? <div><dt>Taxa de limpeza</dt><dd>{brl(b.cleaning)}</dd></div> : null}
              <div className="breakdown__total"><dt>Total</dt><dd>{brl(b.total)}</dd></div>
              <div className="breakdown__deposit"><dt>Sinal</dt><dd>{brl(b.deposit)}</dd></div>
              <div><dt>Saldo no check-in</dt><dd>{brl(Number(b.total) - Number(b.deposit))}</dd></div>
            </dl>
            {pay.terms ? <p className="terms">{pay.terms}</p> : null}
          </section>

          <p className="receipt__small receipt__save">Guarde este link: é por ele que você acompanha a sua reserva.</p>
          {b.status !== 'pending' && wa ? <a className="btn btn--ghost btn--block" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={20} />Falar com o anfitrião</a> : null}
          <a className="btn btn--ghost btn--block" href="/">Voltar ao site</a>
        </main>
      </div>
    </>
  );
}
