import { STATUS, statusReal } from '@/components/Atendimento';
import { hora, minutoNoDia, minutos } from '@/lib/datas';

const PX = 1.1; // pixels por minuto (1 hora = 66px)
const pad = (n) => String(n).padStart(2, '0');

/**
 * O dia dividido por horário: expediente, atendimentos (tocar leva ao cartão com as ações),
 * bloqueios e a linha de "agora". Fora do expediente fica hachurado.
 * `faixas`: horários de trabalho do dia da semana [{ starts: '09:00:00', ends: '12:00:00' }].
 */
export function LinhaDoTempo({ dia, tz, ags, blocos, faixas, agora }) {
  const visiveis = ags.filter((a) => !['cancelled', 'expired'].includes(statusReal(a)));
  const trab = faixas.map((f) => [minutos(f.starts), minutos(f.ends)]).sort((a, b) => a[0] - b[0]);
  const eventos = visiveis.map((a) => [minutoNoDia(a.starts_at, dia, tz), minutoNoDia(a.ends_at, dia, tz)]);
  const bloq = blocos.map((b) => [minutoNoDia(b.starts_at, dia, tz), minutoNoDia(b.ends_at, dia, tz)]);
  const todos = [...trab, ...eventos];
  if (!todos.length) {
    return <p className="vazio">Sem expediente neste dia.</p>;
  }
  const ini = Math.floor(Math.min(...todos.map((x) => x[0])) / 60) * 60;
  const fim = Math.min(1440, Math.ceil(Math.max(...todos.map((x) => x[1])) / 60) * 60);
  const y = (min) => (Math.min(Math.max(min, ini), fim) - ini) * PX;

  // Intervalos fora do expediente dentro da faixa mostrada.
  const fora = [];
  let cursor = ini;
  for (const [a, b] of trab) {
    if (a > cursor) fora.push([cursor, a]);
    cursor = Math.max(cursor, b);
  }
  if (cursor < fim) fora.push([cursor, fim]);

  const horas = [];
  for (let m = ini; m <= fim; m += 60) horas.push(m);

  // Atendimentos que se cruzam (ex.: um sinal pendente no mesmo horário) ficam lado a lado.
  const coluna = [];
  const colunas = [];
  const ordem = eventos.map((_, i) => i).sort((a, b) => eventos[a][0] - eventos[b][0]);
  let grupo = [];
  let fimGrupo = -1;
  const fechar = () => {
    const n = Math.max(1, ...grupo.map((i) => coluna[i] + 1));
    grupo.forEach((i) => (colunas[i] = n));
    grupo = [];
  };
  const livres = [];
  for (const i of ordem) {
    const [a, b] = eventos[i];
    if (a >= fimGrupo && grupo.length) {
      fechar();
      livres.length = 0;
    }
    let c = livres.findIndex((f) => f <= a);
    if (c === -1) c = livres.length;
    livres[c] = b;
    coluna[i] = c;
    grupo.push(i);
    fimGrupo = Math.max(fimGrupo, b);
  }
  if (grupo.length) fechar();

  return (
    <div className="tl" style={{ height: (fim - ini) * PX }} aria-label="Agenda do dia por horário">
      {horas.map((m) => (
        <div key={m} className="tl__hora" style={{ top: y(m) }}>
          <span>{pad(m / 60)}:00</span>
        </div>
      ))}
      {fora.map(([a, b]) => (
        <div key={`f${a}`} className="tl__fora" style={{ top: y(a), height: y(b) - y(a) }} aria-hidden="true" />
      ))}
      {blocos.map((b, i) => (
        <div key={b.id} className="tl__bloqueio" style={{ top: y(bloq[i][0]), height: Math.max(y(bloq[i][1]) - y(bloq[i][0]), 22) }}>
          <span>Bloqueado{b.reason ? ` · ${b.reason}` : ''}</span>
        </div>
      ))}
      {visiveis.map((a, i) => {
        const [, classe] = STATUS[statusReal(a)];
        const alto = y(eventos[i][1]) - y(eventos[i][0]);
        return (
          <a
            key={a.id}
            href={`#at-${a.id}`}
            className={`tl__ev tl__ev--${classe}${alto < 52 ? ' tl__ev--curto' : ''}`}
            style={{
              top: y(eventos[i][0]),
              height: Math.max(alto - 2, 26),
              ...(colunas[i] > 1 ? { left: `calc(4px + ${(coluna[i] / colunas[i]) * 100}%)`, right: 'auto', width: `calc(${100 / colunas[i]}% - 6px)` } : {}),
            }}
          >
            <strong>{hora(a.starts_at, tz)}–{hora(a.ends_at, tz)} · {a.client_name}</strong>
            <span>{a.service_name}</span>
          </a>
        );
      })}
      {agora != null && agora >= ini && agora <= fim ? (
        <div className="tl__agora" style={{ top: y(agora) }} aria-label="Agora" />
      ) : null}
    </div>
  );
}
