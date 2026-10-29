'use client';
import { useActionState } from 'react';
import { aceitarConvite } from '../actions';

export function Cadastro({ token, studio }) {
  const [estado, enviar, enviando] = useActionState(aceitarConvite, null);
  return (
    <form className="card login__card" action={enviar}>
      <p className="kicker">Painel do studio</p>
      <h1 className="titulo">Crie seu acesso</h1>
      <p className="muted">
        Bem-vinda ao painel do <strong>{studio}</strong>. Escolha o e-mail e a senha que você vai usar para entrar. Este link vale uma vez só.
      </p>
      <input type="hidden" name="token" value={token} />
      <label className="campo">E-mail<input name="email" type="email" required autoComplete="email" /></label>
      <label className="campo">Senha<input name="senha" type="password" required minLength={8} autoComplete="new-password" /></label>
      <label className="campo">Repita a senha<input name="confirmar" type="password" required minLength={8} autoComplete="new-password" /></label>
      {estado?.erro ? <p className="aviso aviso--erro" role="alert">{estado.erro}</p> : null}
      <button className="btn btn--primario btn--bloco" type="submit" disabled={enviando}>{enviando ? 'Criando…' : 'Criar acesso'}</button>
    </form>
  );
}
