import { getPainel } from '@/lib/supabase/server';
import { diaCurto, diaDe, hora, reais, whatsapp } from '@/lib/datas';

const fone = (d) => (d?.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d?.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d || '');
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Clientes do studio (cadastradas pelo WhatsApp no site ou nos encaixes), com histórico resumido.
export default async function ClientesPage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const tz = studio.timezone;
  const { data } = await supabase
    .from('clients')
    .select('id, name, phone, created_at, appointments(starts_at, status, price, service_name)')
    .eq('studio_id', studio.id)
    .order('name');

  const agora = Date.now();
  const busca = norm(sp?.q).trim();
  const lista = (data || [])
    .map((c) => {
      const ags = c.appointments || [];
      const feitos = ags.filter((a) => a.status === 'done' || (a.status === 'confirmed' && new Date(a.starts_at).getTime() < agora));
      const proximo = ags
        .filter((a) => ['confirmed', 'pending'].includes(a.status) && new Date(a.starts_at).getTime() >= agora)
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
      const ultimo = feitos.sort((a, b) => b.starts_at.localeCompare(a.starts_at))[0];
      return { ...c, atendimentos: feitos.length, gasto: feitos.reduce((s, a) => s + Number(a.price), 0), proximo, ultimo, faltas: ags.filter((a) => a.status === 'no_show').length };
    })
    .filter((c) => !busca || norm(c.name).includes(busca) || c.phone.includes(busca.replace(/\D/g, '') || '§'));

  return (
    <>
      <h1 className="titulo">Clientes</h1>
      <p className="muted">
        {(data || []).length} {(data || []).length === 1 ? 'cliente cadastrada' : 'clientes cadastradas'}. Quem agenda pelo site entra aqui pelo WhatsApp e, na próxima vez, é reconhecida sem digitar o nome.
      </p>
      <form className="busca" action="/clientes" method="get">
        <input name="q" defaultValue={sp?.q || ''} placeholder="Buscar por nome ou WhatsApp" aria-label="Buscar cliente" />
        <button className="btn btn--mini" type="submit">Buscar</button>
      </form>
      {lista.length ? (
        <ul className="lista lista--compacta">
          {lista.map((c) => (
            <li key={c.id} className="cliente">
              <div className="cliente__topo">
                <strong>{c.name}</strong>
                <a className="btn btn--mini" href={whatsapp(c.phone, `Olá, ${c.name.split(' ')[0]}!`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </div>
              <p className="item__sub">{fone(c.phone)}</p>
              <p className="cliente__info">
                <span>{c.atendimentos} {c.atendimentos === 1 ? 'atendimento' : 'atendimentos'}</span>
                {c.gasto ? <span>{reais(c.gasto)}</span> : null}
                {c.faltas ? <span className="cliente__falta">{c.faltas} {c.faltas === 1 ? 'falta' : 'faltas'}</span> : null}
                {c.ultimo ? <span>Último: {diaCurto(c.ultimo.starts_at, tz)}</span> : null}
              </p>
              {c.proximo ? (
                <a className="link" href={`/agenda?dia=${diaDe(c.proximo.starts_at, tz)}`}>
                  Próximo: {c.proximo.service_name} · {diaCurto(c.proximo.starts_at, tz)} às {hora(c.proximo.starts_at, tz)}
                  {c.proximo.status === 'pending' ? ' (aguardando sinal)' : ''}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="vazio">{busca ? 'Nenhuma cliente encontrada.' : 'Nenhuma cliente cadastrada ainda.'}</p>
      )}
    </>
  );
}
