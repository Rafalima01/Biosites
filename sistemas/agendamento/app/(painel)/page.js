import { redirect } from 'next/navigation';
import { getPainel } from '@/lib/supabase/server';
import { STATUS, statusReal } from '@/components/Atendimento';
import {
  diaDaSemana, diaDe, diasNoMes, hoje, hora, mesDe, mesValido, minutos, nomeMes, noFuso, reais, somaMeses, valido,
} from '@/lib/datas';

export const metadata = { title: 'Dashboard · Painel do studio' };

const pct = (n) => `${Math.round(n * 100)}%`;
const qtd = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

/** Números de um mês: o que já foi feito (faturado), o que está marcado (agendado) e o desempenho. */
function resumo(lista, agora, ateDia = 31) {
  const doPeriodo = lista.filter((a) => Number(a.dia.slice(8)) <= ateDia);
  const realizados = doPeriodo.filter((a) => a.status === 'done' || (a.status === 'confirmed' && new Date(a.ends_at) <= agora));
  const agendados = doPeriodo.filter((a) => a.status === 'confirmed' && new Date(a.ends_at) > agora);
  const faltas = doPeriodo.filter((a) => a.status === 'no_show').length;
  const soma = (l, k = 'price') => l.reduce((s, a) => s + Number(a[k] || 0), 0);
  const faturado = soma(realizados);
  return {
    realizados,
    agendados,
    faturado,
    previsto: soma(agendados),
    sinais: soma(doPeriodo.filter((a) => ['confirmed', 'done', 'no_show'].includes(a.status)), 'deposit'),
    ticket: realizados.length ? faturado / realizados.length : 0,
    faltas,
    comparecimento: realizados.length + faltas ? realizados.length / (realizados.length + faltas) : null,
    cancelados: doPeriodo.filter((a) => a.status === 'cancelled').length,
    naoPagos: doPeriodo.filter((a) => statusReal(a) === 'expired').length,
    minutosOcupados: [...realizados, ...agendados].reduce((s, a) => s + (new Date(a.ends_at) - new Date(a.starts_at)) / 60000, 0),
    clientes: new Set([...realizados, ...agendados].map((a) => a.client_id || a.client_phone || a.client_name)).size,
  };
}

// Dashboard: resumo financeiro e de desempenho do studio no mês.
export default async function DashboardPage({ searchParams }) {
  const sp = await searchParams;
  // Links antigos e avisos do celular apontavam para "/?dia=…": agora a agenda fica em /agenda.
  if (valido(sp?.dia)) redirect(`/agenda?${new URLSearchParams(sp).toString()}`);

  const { supabase, studio } = await getPainel();
  const tz = studio.timezone;
  const agora = new Date();
  const hojeDia = hoje(tz);
  const mesAtual = mesDe(hojeDia);
  const mes = mesValido(sp?.mes) ? sp.mes : mesAtual;
  const anterior = somaMeses(mes, -1);
  const inicio = (m) => noFuso(`${m}-01`, '00:00', tz).toISOString();
  const ehAtual = mes === mesAtual;

  const [{ data: ags }, { count: novas }, { data: faixas }, { data: pend }, { data: deHoje }] = await Promise.all([
    supabase
      .from('appointments')
      .select('starts_at, ends_at, status, expires_at, price, deposit, service_name, client_id, client_phone, client_name')
      .eq('studio_id', studio.id)
      .gte('starts_at', inicio(anterior))
      .lt('starts_at', inicio(somaMeses(mes, 1))),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('studio_id', studio.id).gte('created_at', inicio(mes)).lt('created_at', inicio(somaMeses(mes, 1))),
    supabase.from('hours').select('weekday, starts, ends').eq('studio_id', studio.id),
    supabase.from('appointments').select('id').eq('studio_id', studio.id).eq('status', 'pending').gt('expires_at', agora.toISOString()),
    supabase
      .from('appointments')
      .select('id, starts_at, client_name, service_name, status, expires_at')
      .eq('studio_id', studio.id)
      .in('status', ['pending', 'confirmed', 'done'])
      .gte('starts_at', noFuso(hojeDia, '00:00', tz).toISOString())
      .lt('starts_at', noFuso(hojeDia, '23:59', tz).toISOString())
      .order('starts_at'),
  ]);

  const todos = (ags || []).map((a) => ({ ...a, dia: diaDe(a.starts_at, tz) }));
  const doMes = todos.filter((a) => mesDe(a.dia) === mes);
  const r = resumo(doMes, agora);
  // Comparação justa: no mês atual, compara com o mês passado até o mesmo dia.
  const base = resumo(todos.filter((a) => mesDe(a.dia) === anterior), agora, ehAtual ? Number(hojeDia.slice(8)) : 31);
  const variacao = base.faturado > 0 ? (r.faturado - base.faturado) / base.faturado : null;

  // Ocupação: minutos marcados ÷ minutos de expediente no mês.
  const porSemana = {};
  for (const f of faixas || []) porSemana[f.weekday] = (porSemana[f.weekday] || 0) + minutos(f.ends) - minutos(f.starts);
  const n = diasNoMes(mes);
  let disponivel = 0;
  for (let d = 1; d <= n; d++) disponivel += porSemana[diaDaSemana(`${mes}-${String(d).padStart(2, '0')}`)] || 0;
  const ocupacao = disponivel ? Math.min(1, r.minutosOcupados / disponivel) : null;

  // Gráfico: valor por dia (realizado ou agendado).
  const porDia = Array.from({ length: n }, (_, i) => ({ d: i + 1, feito: 0, marcado: 0 }));
  for (const a of r.realizados) porDia[Number(a.dia.slice(8)) - 1].feito += Number(a.price);
  for (const a of r.agendados) porDia[Number(a.dia.slice(8)) - 1].marcado += Number(a.price);
  const maxDia = Math.max(1, ...porDia.map((x) => x.feito + x.marcado));
  const temGrafico = porDia.some((x) => x.feito + x.marcado > 0);
  const diaHoje = ehAtual ? Number(hojeDia.slice(8)) : null;

  // Serviços que mais rendem (feitos + marcados).
  const servicos = {};
  for (const a of [...r.realizados, ...r.agendados]) {
    servicos[a.service_name] ??= { nome: a.service_name, qtd: 0, valor: 0 };
    servicos[a.service_name].qtd += 1;
    servicos[a.service_name].valor += Number(a.price);
  }
  const top = Object.values(servicos).sort((a, b) => b.valor - a.valor).slice(0, 5);
  const maxServ = Math.max(1, ...top.map((s) => s.valor));
  const pendentes = (pend || []).length;
  const hojeLista = (deHoje || []).filter((a) => statusReal(a) !== 'expired');

  return (
    <>
      <div className="dia">
        <a className="btn btn--mini" href={`/?mes=${anterior}`} aria-label="Mês anterior">‹</a>
        <div className="dia__nome">
          <p className="kicker">Resumo do mês</p>
          <h1 className="titulo">{nomeMes(mes)}</h1>
          {ehAtual ? null : <a className="link" href="/">Voltar para este mês</a>}
        </div>
        <a className="btn btn--mini" href={`/?mes=${somaMeses(mes, 1)}`} aria-label="Próximo mês">›</a>
      </div>

      {pendentes ? (
        <a className="alerta" href="/pedidos">
          <strong>{qtd(pendentes, 'agendamento aguardando sinal', 'agendamentos aguardando sinal')}</strong>
          <span>Confira os comprovantes →</span>
        </a>
      ) : null}

      <section className="card destaque" aria-labelledby="faturado">
        <p className="destaque__rotulo" id="faturado">Faturado {ehAtual ? 'até hoje' : 'no mês'}</p>
        <p className="destaque__valor">{reais(r.faturado)}</p>
        <p className="destaque__nota">
          {variacao == null
            ? `${qtd(r.realizados.length, 'atendimento realizado', 'atendimentos realizados')}`
            : (
              <>
                <span className={variacao >= 0 ? 'sobe' : 'desce'}>{variacao >= 0 ? '▲' : '▼'} {pct(Math.abs(variacao))}</span>{' '}
                {ehAtual ? 'que o mês passado até o mesmo dia' : 'que o mês anterior'}
              </>
            )}
        </p>
      </section>

      <div className="kpis">
        <div className="kpi"><span>Agendado</span><strong>{reais(r.previsto)}</strong><small>{qtd(r.agendados.length, 'atendimento por vir', 'atendimentos por vir')}</small></div>
        <div className="kpi"><span>Sinais recebidos</span><strong>{reais(r.sinais)}</strong><small>no mês</small></div>
        <div className="kpi"><span>Ticket médio</span><strong>{reais(r.ticket)}</strong><small>por atendimento</small></div>
        <div className="kpi"><span>Clientes</span><strong>{r.clientes}</strong><small>{qtd(novas || 0, 'nova', 'novas')} no mês</small></div>
      </div>

      <section className="card grafico" aria-labelledby="g-titulo">
        <div className="grafico__topo">
          <h2 className="subtitulo" id="g-titulo">Faturamento por dia</h2>
          <p className="grafico__legenda">
            <span><i className="sw sw--feito" />Realizado</span>
            <span><i className="sw sw--marcado" />Agendado</span>
          </p>
        </div>
        {temGrafico ? (
          <>
            <div className="barras" role="img" aria-label={`Faturamento por dia em ${nomeMes(mes)}`}>
              {porDia.map((x) => {
                const total = x.feito + x.marcado;
                const dica = `Dia ${x.d}: ${total ? `${x.feito ? `${reais(x.feito)} realizado` : ''}${x.feito && x.marcado ? ' + ' : ''}${x.marcado ? `${reais(x.marcado)} agendado` : ''}` : 'nada'}`;
                return (
                  <div key={x.d} className={`barras__col${x.d === diaHoje ? ' barras__col--hoje' : ''}`} title={dica} data-dica={dica}>
                    <div className="barras__pilha" style={{ height: `${(total / maxDia) * 100}%` }}>
                      {x.marcado ? <i className="barras__seg barras__seg--marcado" style={{ flexGrow: x.marcado }} /> : null}
                      {x.feito ? <i className="barras__seg barras__seg--feito" style={{ flexGrow: x.feito }} /> : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="barras__eixo" aria-hidden="true">
              {porDia.map((x) => (
                <span key={x.d}>{x.d === diaHoje || ((x.d === 1 || x.d % 5 === 0) && !(diaHoje && Math.abs(x.d - diaHoje) <= 1)) ? x.d : ''}</span>
              ))}
            </div>
            <details className="tabela">
              <summary>Ver em tabela</summary>
              <table>
                <thead><tr><th>Dia</th><th>Realizado</th><th>Agendado</th></tr></thead>
                <tbody>
                  {porDia.filter((x) => x.feito + x.marcado).map((x) => (
                    <tr key={x.d}><td>{x.d}</td><td>{reais(x.feito)}</td><td>{reais(x.marcado)}</td></tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        ) : (
          <p className="vazio">Nenhum atendimento neste mês ainda.</p>
        )}
      </section>

      <section className="card" aria-labelledby="d-titulo">
        <h2 className="subtitulo" id="d-titulo">Desempenho</h2>
        <div className="desemp">
          <div className="desemp__item">
            <span>Ocupação da agenda</span>
            <strong>{ocupacao == null ? '—' : pct(ocupacao)}</strong>
            {ocupacao == null ? null : <i className="medidor"><b style={{ width: pct(ocupacao) }} /></i>}
            <small>horas marcadas do expediente</small>
          </div>
          <div className="desemp__item">
            <span>Comparecimento</span>
            <strong>{r.comparecimento == null ? '—' : pct(r.comparecimento)}</strong>
            <small>{qtd(r.faltas, 'falta', 'faltas')}</small>
          </div>
          <div className="desemp__item">
            <span>Atendimentos</span>
            <strong>{r.realizados.length + r.agendados.length}</strong>
            <small>{r.realizados.length} feitos · {r.agendados.length} por vir</small>
          </div>
          <div className="desemp__item">
            <span>Perdidos</span>
            <strong>{r.cancelados + r.naoPagos}</strong>
            <small>{qtd(r.cancelados, 'cancelado', 'cancelados')} · {r.naoPagos} sem sinal</small>
          </div>
        </div>
      </section>

      {top.length ? (
        <section className="card" aria-labelledby="s-titulo">
          <h2 className="subtitulo" id="s-titulo">Serviços que mais rendem</h2>
          <ul className="ranking">
            {top.map((s) => (
              <li key={s.nome} title={`${s.nome}: ${qtd(s.qtd, 'atendimento', 'atendimentos')}, ${reais(s.valor)}`}>
                <div className="ranking__linha">
                  <span className="ranking__nome">{s.nome}</span>
                  <strong>{reais(s.valor)}</strong>
                </div>
                <i className="ranking__barra"><b style={{ width: `${(s.valor / maxServ) * 100}%` }} /></i>
                <small>{qtd(s.qtd, 'atendimento', 'atendimentos')}</small>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="proximos" aria-labelledby="h-titulo">
        <div className="secao__topo">
          <h2 className="subtitulo" id="h-titulo">Hoje</h2>
          <a className="link" href="/agenda">Abrir agenda →</a>
        </div>
        {hojeLista.length ? (
          <ul className="lista lista--compacta">
            {hojeLista.map((a) => {
              const [rotulo, classe] = STATUS[statusReal(a)];
              return (
                <li key={a.id}>
                  <a className={`linha linha--${classe}`} href={`/agenda#at-${a.id}`}>
                    <span className="linha__quando"><strong>{hora(a.starts_at, tz)}</strong></span>
                    <span className="linha__quem"><strong>{a.client_name}</strong><small>{a.service_name}</small></span>
                    <span className={`selo selo--${classe}`}>{rotulo}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="vazio">Nenhum atendimento hoje.</p>
        )}
      </section>
    </>
  );
}
