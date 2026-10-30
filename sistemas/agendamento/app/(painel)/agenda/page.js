import Link from 'next/link';
import { getPainel } from '@/lib/supabase/server';
import { sinalDoStudio } from '@/lib/configuracoes';
import { encaixar, desbloquear } from '../../actions';
import { Atendimento, Retorno, statusReal } from '@/components/Atendimento';
import { Calendario } from '@/components/Calendario';
import { LinhaDoTempo } from '@/components/LinhaDoTempo';
import {
  diaDaSemana, diaDe, diaLongo, hoje, maiuscula, hora, mesDe, minutos, noFuso, reais, somaDias, somaMeses, valido,
} from '@/lib/datas';

// Agenda: calendário do mês (quantos atendimentos por dia) e o dia escolhido dividido por horário.
export const metadata = { title: 'Agenda · Painel do studio' };

export default async function AgendaPage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const exigeSinal = sinalDoStudio(studio).exige;
  const tz = studio.timezone;
  const hojeDia = hoje(tz);
  const dia = valido(sp?.dia) ? sp.dia : hojeDia;
  const de = noFuso(dia, '00:00', tz).toISOString();
  const ate = noFuso(somaDias(dia, 1), '00:00', tz).toISOString();
  // O calendário cobre a grade inteira (pode começar no mês anterior e terminar no seguinte).
  const mes = mesDe(dia);
  const gradeDe = noFuso(somaDias(`${mes}-01`, -7), '00:00', tz).toISOString();
  const gradeAte = noFuso(`${somaMeses(mes, 1)}-08`, '00:00', tz).toISOString();

  const [{ data: ags }, { data: blocos }, { data: servicos }, { data: doMes }, { data: blocosMes }, { data: faixas }] = await Promise.all([
    supabase.from('appointments').select('*').eq('studio_id', studio.id).gte('starts_at', de).lt('starts_at', ate).order('starts_at'),
    supabase.from('blocks').select('*').eq('studio_id', studio.id).lt('starts_at', ate).gt('ends_at', de).order('starts_at'),
    supabase.from('services').select('id, name, minutes, price, active').eq('studio_id', studio.id).eq('active', true).order('sort'),
    supabase
      .from('appointments')
      .select('starts_at, status, expires_at')
      .eq('studio_id', studio.id)
      .in('status', ['pending', 'confirmed', 'done'])
      .gte('starts_at', gradeDe)
      .lt('starts_at', gradeAte),
    supabase.from('blocks').select('starts_at, ends_at').eq('studio_id', studio.id).lt('starts_at', gradeAte).gt('ends_at', gradeDe),
    supabase.from('hours').select('weekday, starts, ends').eq('studio_id', studio.id),
  ]);

  // Marcas do calendário: atendimentos por dia (sem os sinais vencidos) e dias com bloqueio.
  const marcas = {};
  for (const a of doMes || []) {
    const st = statusReal(a);
    if (st === 'expired') continue;
    const d = diaDe(a.starts_at, tz);
    marcas[d] ??= { total: 0, pendentes: 0 };
    marcas[d].total += 1;
    if (st === 'pending') marcas[d].pendentes += 1;
  }
  for (const b of blocosMes || []) {
    for (let d = diaDe(b.starts_at, tz), fim = diaDe(b.ends_at, tz); d <= fim; d = somaDias(d, 1)) {
      marcas[d] ??= { total: 0, pendentes: 0 };
      marcas[d].bloqueio = true;
    }
  }

  const lista = ags || [];
  const ativos = lista.filter((a) => ['confirmed', 'done', 'pending'].includes(statusReal(a)));
  const aguardando = lista.filter((a) => statusReal(a) === 'pending').length;
  const previsto = ativos.reduce((s, a) => s + Number(a.price), 0);
  const voltar = `/agenda?dia=${dia}`;
  const ehHoje = dia === hojeDia;
  const faixasDia = (faixas || []).filter((f) => f.weekday === diaDaSemana(dia));
  const agora = ehHoje ? minutos(hora(new Date().toISOString(), tz)) : null;

  return (
    <div className="agenda">
      <div className="agenda__lado">
        <Calendario dia={dia} hojeDia={hojeDia} marcas={marcas} exigeSinal={exigeSinal} />
        <Encaixe servicos={servicos || []} dia={dia} voltar={voltar} />
      </div>

      <div className="agenda__dia">
      <Retorno sp={sp} />

      <div className="agenda__atalhos">
        <Link className="btn btn--mini" href="/bloqueios">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" /><path d="M5.6 5.6l12.8 12.8" /></svg>
          Bloquear horários
        </Link>
      </div>

      <section className="dia-sel" aria-labelledby="dia-titulo">
        <div className="dia">
          <Link className="btn btn--mini" href={`/agenda?dia=${somaDias(dia, -1)}`} aria-label="Dia anterior">‹</Link>
          <div className="dia__nome">
            <h2 className="titulo" id="dia-titulo">{ehHoje ? 'Hoje' : maiuscula(diaLongo(dia))}</h2>
            {ehHoje ? <p className="muted">{diaLongo(dia)}</p> : <Link className="link" href="/agenda">Voltar para hoje</Link>}
          </div>
          <Link className="btn btn--mini" href={`/agenda?dia=${somaDias(dia, 1)}`} aria-label="Próximo dia">›</Link>
        </div>

        <div className="numeros">
          <div><strong>{ativos.length}</strong><span>atendimentos</span></div>
          {exigeSinal ? <div><strong>{aguardando}</strong><span>aguardando sinal</span></div> : null}
          <div><strong>{reais(previsto)}</strong><span>previsto no dia</span></div>
        </div>

        <div className="card card--tl">
          <LinhaDoTempo dia={dia} tz={tz} ags={lista} blocos={blocos || []} faixas={faixasDia} agora={agora} />
        </div>
      </section>

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
        <section className="proximos">
          <h2 className="subtitulo">Atendimentos do dia</h2>
          <ul className="lista">
            {lista.map((a) => (
              <Atendimento key={a.id} a={a} tz={tz} studio={studio.name} voltar={voltar} />
            ))}
          </ul>
        </section>
      ) : null}

      </div>
    </div>
  );
}

/** Encaixe rápido de um atendimento combinado pelo WhatsApp. */
function Encaixe({ servicos, dia, voltar }) {
  return (
    <details className="card encaixe">
      <summary>+ Encaixar atendimento</summary>
      <p className="muted">Para horários combinados pelo WhatsApp. Entra confirmado e já ocupa a agenda do site.</p>
      <form action={encaixar} className="form">
        <input type="hidden" name="voltar" value={voltar} />
        <input type="hidden" name="dia" value={dia} />
        <label className="campo">Serviço
          <select name="servico" required>
            {servicos.map((s) => (
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
  );
}
