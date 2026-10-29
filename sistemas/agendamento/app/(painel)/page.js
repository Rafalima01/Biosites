import { getPainel } from '@/lib/supabase/server';
import { encaixar, desbloquear } from '../actions';
import { Atendimento, Retorno, STATUS, statusReal } from '@/components/Atendimento';
import { diaCurto, diaDe, diaLongo, hoje, hora, noFuso, reais, somaDias, valido } from '@/lib/datas';

// Agenda do dia: atendimentos, bloqueios, totais e encaixe rápido.
export default async function AgendaPage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const tz = studio.timezone;
  const dia = valido(sp?.dia) ? sp.dia : hoje(tz);
  const de = noFuso(dia, '00:00', tz).toISOString();
  const ate = noFuso(somaDias(dia, 1), '00:00', tz).toISOString();

  const [{ data: ags }, { data: blocos }, { data: servicos }, { data: futuros }] = await Promise.all([
    supabase.from('appointments').select('*').eq('studio_id', studio.id).gte('starts_at', de).lt('starts_at', ate).order('starts_at'),
    supabase.from('blocks').select('*').eq('studio_id', studio.id).lt('starts_at', ate).gt('ends_at', de).order('starts_at'),
    supabase.from('services').select('id, name, minutes, price, active').eq('studio_id', studio.id).eq('active', true).order('sort'),
    // Próximos atendimentos (de agora em diante), para nada ficar escondido em outro dia.
    supabase
      .from('appointments')
      .select('id, starts_at, client_name, service_name, status, expires_at')
      .eq('studio_id', studio.id)
      .in('status', ['confirmed', 'pending'])
      .gte('starts_at', new Date().toISOString())
      .order('starts_at')
      .limit(40),
  ]);
  const proximos = (futuros || []).filter((a) => statusReal(a) !== 'expired' && diaDe(a.starts_at, tz) !== dia).slice(0, 20);
  const lista = ags || [];
  const ativos = lista.filter((a) => ['confirmed', 'done'].includes(statusReal(a)) || statusReal(a) === 'pending');
  const aguardando = lista.filter((a) => statusReal(a) === 'pending').length;
  const previsto = ativos.reduce((s, a) => s + Number(a.price), 0);
  const voltar = `/?dia=${dia}`;
  const ehHoje = dia === hoje(tz);

  return (
    <>
      <div className="dia">
        <a className="btn btn--mini" href={`/?dia=${somaDias(dia, -1)}`} aria-label="Dia anterior">‹</a>
        <div className="dia__nome">
          <h1 className="titulo">{ehHoje ? 'Hoje' : diaLongo(dia)}</h1>
          {ehHoje ? <p className="muted">{diaLongo(dia)}</p> : <a className="link" href="/">Voltar para hoje</a>}
        </div>
        <a className="btn btn--mini" href={`/?dia=${somaDias(dia, 1)}`} aria-label="Próximo dia">›</a>
      </div>
      <form className="dia__ir" action="/" method="get">
        <input type="date" name="dia" defaultValue={dia} aria-label="Ir para o dia" />
        <button className="btn btn--mini" type="submit">Ir</button>
      </form>

      <Retorno sp={sp} />

      <div className="numeros">
        <div><strong>{ativos.length}</strong><span>atendimentos</span></div>
        <div><strong>{aguardando}</strong><span>aguardando sinal</span></div>
        <div><strong>{reais(previsto)}</strong><span>previsto no dia</span></div>
      </div>

      {(blocos || []).length ? (
        <ul className="lista">
          {blocos.map((b) => (
            <li key={b.id} className="item item--bloqueio">
              <div className="item__hora"><strong>{hora(b.starts_at, tz)}</strong><small>até {hora(b.ends_at, tz)}</small></div>
              <div className="item__corpo">
                <p className="item__titulo">Bloqueado{b.reason ? `: ${b.reason}` : ''}</p>
                <form action={desbloquear}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="voltar" value={voltar} />
                  <button className="btn btn--mini btn--fantasma" type="submit">Remover bloqueio</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {lista.length ? (
        <ul className="lista">
          {lista.map((a) => (
            <Atendimento key={a.id} a={a} tz={tz} studio={studio.name} voltar={voltar} />
          ))}
        </ul>
      ) : (
        <p className="vazio">Nenhum atendimento neste dia.</p>
      )}

      {proximos.length ? (
        <section className="proximos">
          <h2 className="subtitulo">Próximos atendimentos</h2>
          <ul className="lista lista--compacta">
            {proximos.map((a) => {
              const [rotulo, classe] = STATUS[statusReal(a)];
              return (
                <li key={a.id}>
                  <a className={`linha linha--${classe}`} href={`/?dia=${diaDe(a.starts_at, tz)}`}>
                    <span className="linha__quando">
                      <strong>{diaCurto(a.starts_at, tz)}</strong>
                      <small>{hora(a.starts_at, tz)}</small>
                    </span>
                    <span className="linha__quem">
                      <strong>{a.client_name}</strong>
                      <small>{a.service_name}</small>
                    </span>
                    <span className={`selo selo--${classe}`}>{rotulo}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <details className="card encaixe">
        <summary>+ Encaixar atendimento</summary>
        <p className="muted">Para horários combinados pelo WhatsApp. Entra confirmado e já ocupa a agenda do site.</p>
        <form action={encaixar} className="form">
          <input type="hidden" name="voltar" value={voltar} />
          <input type="hidden" name="dia" value={dia} />
          <label className="campo">Serviço
            <select name="servico" required>
              {(servicos || []).map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.minutes} min · {reais(s.price)}</option>
              ))}
            </select>
          </label>
          <label className="campo">Horário<input type="time" name="hora" required step="300" /></label>
          <label className="campo">Nome da cliente<input name="nome" required minLength={2} /></label>
          <label className="campo">WhatsApp (opcional)<input name="telefone" inputMode="tel" /></label>
          <label className="campo">Observação (opcional)<input name="obs" maxLength={500} /></label>
          <button className="btn btn--primario btn--bloco" type="submit">Encaixar</button>
        </form>
      </details>
    </>
  );
}
