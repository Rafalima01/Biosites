'use client';
import { useActionState } from 'react';
import { aceitarConvite } from '../actions';
import { CampoSenha } from '@/components/CampoSenha';

export function Cadastro({ token, studio }) {
  const [estado, enviar, enviando] = useActionState(aceitarConvite, null);
  return (
    <form className="card login__card" action={enviar}>
      <img className="login__icone" src="/icone-192.png" alt="" width="64" height="64" />
      <p className="kicker">Painel de agendamentos</p>
      <h1 className="titulo">Crie seu acesso</h1>
      <p className="muted">
        Boas-vindas ao painel do <strong>{studio}</strong>. Escolha o e-mail e a senha que você vai usar para entrar. Este link vale uma vez só.
      </p>
      <input type="hidden" name="token" value={token} />
      <label className="campo">E-mail<input name="email" type="email" required autoComplete="email" /></label>
      <CampoSenha name="senha" required minLength={8} autoComplete="new-password" />
      <CampoSenha rotulo="Repita a senha" name="confirmar" required minLength={8} autoComplete="new-password" />
      {estado?.erro ? <p className="aviso aviso--erro" role="alert">{estado.erro}</p> : null}
      <button className="btn btn--primario btn--bloco" type="submit" disabled={enviando}>{enviando ? 'Criando…' : 'Criar acesso'}</button>
    </form>
  );
}
