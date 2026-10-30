'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { CampoSenha } from '@/components/CampoSenha';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setEntrando(true);
    setErro('');
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) {
      setEntrando(false);
      setErro(/invalid/i.test(error.message) ? 'E-mail ou senha incorretos.' : 'Não foi possível entrar agora. Tente de novo.');
      return;
    }
    router.replace('/');
    router.refresh();
  }

  return (
    <main className="login">
      <form className="card login__card" onSubmit={entrar}>
        <img className="login__icone" src="/icone-192.png" alt="" width="64" height="64" />
        <p className="kicker">Painel de agendamentos</p>
        <h1 className="titulo">Sua agenda</h1>
        <p className="muted">Entre para ver seus horários, acompanhar os agendamentos e bloquear a agenda.</p>
        <label className="campo">E-mail<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <CampoSenha required autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        {erro ? <p className="aviso aviso--erro" role="alert">{erro}</p> : null}
        <button className="btn btn--primario btn--bloco" type="submit" disabled={entrando}>{entrando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </main>
  );
}
