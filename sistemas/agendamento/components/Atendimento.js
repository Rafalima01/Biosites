import { mudarStatus } from '@/app/actions';
import { hora, reais, whatsapp, diaCurto } from '@/lib/datas';

export const STATUS = {
  pending: ['Aguardando sinal', 'pendente'],
  expired: ['Sinal não pago', 'expirado'],
  confirmed: ['Confirmado', 'confirmado'],
  done: ['Realizado', 'feito'],
  no_show: ['Faltou', 'faltou'],
  cancelled: ['Cancelado', 'cancelado'],
};

export const statusReal = (a) => (a.status === 'pending' && new Date(a.expires_at) <= new Date() ? 'expired' : a.status);

const Botao = ({ id, status, voltar, children, estilo = '' }) => (
  <form action={mudarStatus}>
    <input type="hidden" name="id" value={id} />
    <input type="hidden" name="status" value={status} />
    <input type="hidden" name="voltar" value={voltar} />
    <button className={`btn btn--mini ${estilo}`} type="submit">{children}</button>
  </form>
);

/** Um atendimento com status, valores, WhatsApp da cliente e as ações possíveis. */
export function Atendimento({ a, tz, studio, voltar, mostrarDia = false, nota = '' }) {
  const st = statusReal(a);
  const [rotulo, classe] = STATUS[st];
  const primeiro = a.client_name.split(' ')[0];
  const zap = whatsapp(a.client_phone, `Olá, ${primeiro}! Aqui é do ${studio}, sobre seu horário de ${a.service_name} (${diaCurto(a.starts_at, tz)} às ${hora(a.starts_at, tz)}).`);
  return (
    <li id={`at-${a.id}`} className={`item item--${classe}`}>
      <div className="item__hora">
        {mostrarDia ? <small>{diaCurto(a.starts_at, tz)}</small> : null}
        <strong>{hora(a.starts_at, tz)}</strong>
        <small>até {hora(a.ends_at, tz)}</small>
      </div>
      <div className="item__corpo">
        <p className="item__titulo">{a.client_name}</p>
        <p className="item__sub">
          {a.service_name} · {reais(a.price)}
          {Number(a.deposit) > 0 ? ` · sinal ${reais(a.deposit)}` : ''}
          {a.source === 'painel' ? ' · encaixe' : ''}
        </p>
        {a.notes ? <p className="item__obs">“{a.notes}”</p> : null}
        {nota ? <p className="prazo">{nota}</p> : null}
        {st === 'confirmed' && new Date(a.ends_at) <= new Date() ? (
          <p className="prazo prazo--marcar">Já passou: marque “Realizado” para lançar o restante ({reais(Number(a.price) - Number(a.deposit))}).</p>
        ) : null}
        <div className="item__acoes">
          <span className={`selo selo--${classe}`}>{rotulo}</span>
          {zap ? <a className="btn btn--mini" href={zap} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
          {st === 'pending' || st === 'expired' ? <Botao id={a.id} status="confirmed" voltar={voltar} estilo="btn--primario">Confirmar sinal</Botao> : null}
          {st === 'confirmed' ? <Botao id={a.id} status="done" voltar={voltar}>Realizado</Botao> : null}
          {st === 'confirmed' ? <Botao id={a.id} status="no_show" voltar={voltar}>Faltou</Botao> : null}
          {st !== 'cancelled' && st !== 'done' ? <Botao id={a.id} status="cancelled" voltar={voltar} estilo="btn--fantasma">Cancelar</Botao> : null}
          {st === 'cancelled' ? <Botao id={a.id} status="confirmed" voltar={voltar}>Reativar</Botao> : null}
        </div>
      </div>
    </li>
  );
}

/** Mensagem de retorno das ações (?ok= ou ?erro=). */
export function Retorno({ sp }) {
  if (sp?.erro) return <p className="aviso aviso--erro" role="alert">{sp.erro}</p>;
  if (sp?.ok) return <p className="aviso aviso--ok" role="status">{sp.ok}</p>;
  return null;
}
