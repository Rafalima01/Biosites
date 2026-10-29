'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { Icon, LogoMark } from '@/components/Icon';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      setError(/invalid/i.test(error.message) ? 'E-mail ou senha incorretos.' : 'Não foi possível entrar agora. Tente novamente.');
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit}>
        <span className="login__logo"><LogoMark size={44} /></span>
        <h1 className="section__title">Painel do anfitrião</h1>
        <p className="section__lead">Entre para gerenciar casas, agenda e reservas.</p>
        <label className="field">E-mail<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="field">Senha<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="btn btn--primary btn--block" type="submit" disabled={loading}><Icon name="lock" size={18} />{loading ? 'Entrando…' : 'Entrar'}</button>
        <a className="login__back" href="/">Voltar ao site</a>
      </form>
    </main>
  );
}
