import Link from 'next/link';
import { nomeMes, somaMeses } from '@/lib/datas';

/** Cabeçalho com o mês e as setas ‹ › (dashboard e financeiro). `base`: a página, ex. '/financeiro'. */
export function MesNav({ base, mes, ehAtual, kicker, className = '' }) {
  const link = (m) => `${base}?mes=${m}`;
  return (
    <div className={`dia ${className}`.trim()}>
      <Link className="btn btn--mini" href={link(somaMeses(mes, -1))} aria-label="Mês anterior">‹</Link>
      <div className="dia__nome">
        <p className="kicker">{kicker}</p>
        <h1 className="titulo">{nomeMes(mes)}</h1>
        {ehAtual ? null : <Link className="link" href={base}>Voltar para este mês</Link>}
      </div>
      <Link className="btn btn--mini" href={link(somaMeses(mes, 1))} aria-label="Próximo mês">›</Link>
    </div>
  );
}
