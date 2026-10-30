'use client';
import { useState } from 'react';

const Olho = ({ aberto }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
    {aberto ? null : <path d="M4 4l16 16" />}
  </svg>
);

/** Campo de senha com o "olhinho" para mostrar ou esconder o que foi digitado. Repassa as props ao input. */
export function CampoSenha({ rotulo = 'Senha', ...props }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <label className="campo">
      {rotulo}
      <span className="campo__senha">
        <input {...props} type={visivel ? 'text' : 'password'} />
        <button
          type="button"
          className="campo__olho"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? 'Esconder senha' : 'Mostrar senha'}
          aria-pressed={visivel}
          title={visivel ? 'Esconder senha' : 'Mostrar senha'}
        >
          <Olho aberto={visivel} />
        </button>
      </span>
    </label>
  );
}
