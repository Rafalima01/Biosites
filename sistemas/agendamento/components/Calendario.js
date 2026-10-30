import Link from 'next/link';
import { diaDaSemana, diasNoMes, mesDe, nomeMes, somaDias, somaMeses } from '@/lib/datas';

const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const rotuloDia = (dia) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: 'numeric', month: 'long' }).format(new Date(`${dia}T12:00:00Z`));

/**
 * Calendário do mês: cada dia mostra quantos atendimentos tem (e se algum aguarda o sinal).
 * Tocar no dia abre a agenda dele logo abaixo. `marcas`: { 'AAAA-MM-DD': { total, pendentes, bloqueio } }.
 */
export function Calendario({ dia, hojeDia, marcas, exigeSinal = true }) {
  const mes = mesDe(dia);
  const primeiro = `${mes}-01`;
  const inicio = somaDias(primeiro, -diaDaSemana(primeiro));
  const total = Math.ceil((diaDaSemana(primeiro) + diasNoMes(mes)) / 7) * 7;
  const dias = Array.from({ length: total }, (_, i) => somaDias(inicio, i));
  // Ao trocar de mês, abre o dia 1 (ou hoje, se for o mês atual).
  const irPara = (m) => (m === mesDe(hojeDia) ? hojeDia : `${m}-01`);

  return (
    <section className="card cal" aria-label={`Calendário de ${nomeMes(mes)}`}>
      <div className="cal__topo">
        <Link className="btn btn--mini" href={`/agenda?dia=${irPara(somaMeses(mes, -1))}`} aria-label="Mês anterior">‹</Link>
        <h1 className="cal__mes">{nomeMes(mes)}</h1>
        <Link className="btn btn--mini" href={`/agenda?dia=${irPara(somaMeses(mes, 1))}`} aria-label="Próximo mês">›</Link>
      </div>
      <div className="cal__grade" role="grid">
        {SEMANA.map((s, i) => (
          <span key={i} className="cal__semana" aria-hidden="true">{s}</span>
        ))}
        {dias.map((d) => {
          const m = marcas[d] || {};
          const classes = [
            'cal__dia',
            mesDe(d) !== mes && 'cal__dia--fora',
            d === hojeDia && 'cal__dia--hoje',
            d === dia && 'is-ativo',
            m.bloqueio && 'cal__dia--bloqueio',
          ].filter(Boolean).join(' ');
          const partes = [rotuloDia(d)];
          if (m.total) partes.push(`${m.total} ${m.total === 1 ? 'atendimento' : 'atendimentos'}`);
          if (m.pendentes) partes.push(`${m.pendentes} aguardando sinal`);
          if (m.bloqueio) partes.push('com bloqueio');
          return (
            <Link key={d} className={classes} href={`/agenda?dia=${d}`} prefetch={false} aria-label={partes.join(', ')} aria-current={d === dia ? 'date' : undefined}>
              <span className="cal__num">{Number(d.slice(8))}</span>
              {m.total ? (
                <span className={`cal__qtd${m.pendentes ? ' cal__qtd--pendente' : ''}`} aria-hidden="true">{m.total}</span>
              ) : (
                <span className="cal__qtd cal__qtd--vazio" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </div>
      <p className="cal__legenda" aria-hidden="true">
        <span><i className="cal__ponto" /> atendimentos</span>
        {exigeSinal ? <span><i className="cal__ponto cal__ponto--pendente" /> com sinal pendente</span> : null}
        <span><i className="cal__ponto cal__ponto--bloqueio" /> bloqueio</span>
      </p>
    </section>
  );
}
