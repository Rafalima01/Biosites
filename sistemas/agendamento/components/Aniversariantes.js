'use client';
import { useEffect, useState } from 'react';

const CHAVE = 'mensagem-aniversario';
const PADRAO =
  'Feliz aniversário, {nome}! 🎉 Aqui é do {studio}. Para comemorar seu dia, você ganhou 10% de desconto no seu próximo atendimento este mês. É só responder aqui para agendar 💜';

const link = (fone, texto) => {
  let d = String(fone || '').replace(/\D/g, '');
  if (d.length <= 11) d = `55${d}`;
  return `https://wa.me/${d}?text=${encodeURIComponent(texto)}`;
};

/**
 * Lista das aniversariantes com o botão de WhatsApp já com a mensagem de parabéns.
 * A mensagem é editável ({nome} e {studio} são trocados) e fica guardada neste aparelho.
 */
export function Aniversariantes({ clientes, studio, mesAtual }) {
  const [texto, setTexto] = useState(PADRAO);
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) setTexto(salvo);
    } catch {}
  }, []);
  function mudar(v) {
    setTexto(v);
    try {
      localStorage.setItem(CHAVE, v);
    } catch {}
  }
  const hoje = new Date();
  const diaHoje = hoje.getDate();

  return (
    <>
      <section className="card niver-msg" aria-labelledby="m-titulo">
        <h2 className="subtitulo" id="m-titulo">Mensagem de parabéns</h2>
        <p className="muted">Use {'{nome}'} para o primeiro nome da cliente. Fica salva neste aparelho.</p>
        <textarea className="niver-msg__texto" value={texto} onChange={(e) => mudar(e.target.value)} rows={4} aria-label="Mensagem de parabéns" />
        {texto !== PADRAO ? (
          <button type="button" className="link niver-msg__padrao" onClick={() => mudar(PADRAO)}>Voltar para a mensagem padrão</button>
        ) : null}
      </section>

      {clientes.length ? (
        <ul className="lista lista--compacta">
          {clientes.map((c) => {
            const primeiro = c.name.split(' ')[0];
            const ehHoje = mesAtual && c.birth_day === diaHoje;
            const passou = mesAtual && c.birth_day < diaHoje;
            return (
              <li key={c.id} className={`niver${ehHoje ? ' niver--hoje' : ''}${passou ? ' niver--passou' : ''}`}>
                <span className="niver__dia"><strong>{String(c.birth_day).padStart(2, '0')}</strong><small>{ehHoje ? 'hoje 🎉' : passou ? 'já passou' : ''}</small></span>
                <span className="niver__quem">
                  <strong>{c.name}</strong>
                  <small>{c.atendimentos} {c.atendimentos === 1 ? 'visita' : 'visitas'}{c.favorito ? ` · gosta de ${c.favorito}` : ''}</small>
                </span>
                <a className="btn btn--mini btn--primario" href={link(c.phone, texto.replaceAll('{nome}', primeiro).replaceAll('{studio}', studio))} target="_blank" rel="noopener noreferrer">
                  Parabenizar
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="vazio">Nenhuma aniversariante neste mês.</p>
      )}
    </>
  );
}
