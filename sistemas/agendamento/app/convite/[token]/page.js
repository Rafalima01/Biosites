import { supabaseAdmin } from '@/lib/supabase/admin';
import { Cadastro } from './Cadastro';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Criar acesso · Painel', robots: { index: false } };

export default async function ConvitePage({ params }) {
  const { token } = await params;
  const admin = supabaseAdmin();
  const { data: convite } = admin && /^[0-9a-f]{64}$/.test(token)
    ? await admin.from('invites').select('used_at, expires_at, studios (name)').eq('token', token).maybeSingle()
    : { data: null };
  const valido = convite && !convite.used_at && new Date(convite.expires_at) > new Date();

  return (
    <main className="login">
      {valido ? (
        <Cadastro token={token} studio={convite.studios?.name || 'seu studio'} />
      ) : (
        <div className="card login__card">
          <p className="kicker">Painel de agendamentos</p>
          <h1 className="titulo">Link indisponível</h1>
          <p className="muted">Este link de cadastro já foi usado ou expirou. Se você já criou seu acesso, é só entrar com seu e-mail e senha.</p>
          <a className="btn btn--primario btn--bloco" href="/login">Entrar</a>
        </div>
      )}
    </main>
  );
}
