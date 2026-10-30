import { getPainel } from '@/lib/supabase/server';
import { bloquear, desbloquear } from '../../actions';
import { Retorno } from '@/components/Atendimento';
import { diaCurto, hoje, hora } from '@/lib/datas';

// Folgas, compromissos e horários fechados: o que estiver bloqueado some da agenda do site.
export const metadata = { title: 'Bloqueios · Painel do studio' };

export default async function BloqueiosPage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const tz = studio.timezone;
  const { data } = await supabase.from('blocks').select('*').eq('studio_id', studio.id).gt('ends_at', new Date().toISOString()).order('starts_at');

  return (
    <>
      <h1 className="titulo">Bloqueios</h1>
      <p className="muted">Bloqueie folgas, compromissos ou qualquer horário em que você não vai atender. Ele some na hora da agenda do site.</p>
      <Retorno sp={sp} />

      <div className="duas-col">
      <form action={bloquear} className="card form">
        <input type="hidden" name="voltar" value="/bloqueios" />
        <label className="campo">Dia<input type="date" name="dia" required defaultValue={hoje(tz)} /></label>
        <label className="check"><input type="checkbox" name="inteiro" value="1" /> Dia inteiro</label>
        <div className="form__linha">
          <label className="campo">Das<input type="time" name="de" step="300" defaultValue="12:00" /></label>
          <label className="campo">Até<input type="time" name="ate" step="300" defaultValue="13:00" /></label>
        </div>
        <label className="campo">Até o dia (opcional, para vários dias)<input type="date" name="ate_dia" /></label>
        <label className="campo">Motivo (só você vê)<input name="motivo" maxLength={120} placeholder="Ex.: folga, médico, curso" /></label>
        <button className="btn btn--primario btn--bloco" type="submit">Bloquear</button>
      </form>

      <div className="duas-col__lista">
      <h2 className="subtitulo">Próximos bloqueios</h2>
      {(data || []).length ? (
        <ul className="lista">
          {data.map((b) => (
            <li key={b.id} className="item item--bloqueio">
              <div className="item__hora"><small>{diaCurto(b.starts_at, tz)}</small><strong>{hora(b.starts_at, tz)}</strong></div>
              <div className="item__corpo">
                <p className="item__titulo">{b.reason || 'Bloqueado'}</p>
                <p className="item__sub">até {diaCurto(b.ends_at, tz)} {hora(b.ends_at, tz)}</p>
                <form action={desbloquear}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="voltar" value="/bloqueios" />
                  <button className="btn btn--mini btn--fantasma" type="submit">Remover</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="vazio">Nenhum bloqueio marcado.</p>
      )}
      </div>
      </div>
    </>
  );
}
