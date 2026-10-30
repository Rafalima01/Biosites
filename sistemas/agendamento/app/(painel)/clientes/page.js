import Link from 'next/link';
import { getPainel } from '@/lib/supabase/server';
import { salvarAniversario } from '../../actions';
import { Retorno } from '@/components/Atendimento';
import { MESES, aniversario, carregarClientes, fone } from '@/lib/clientes';
import { diaCurto, diaDe, hora, reais, whatsapp } from '@/lib/datas';

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Clientes do studio (cadastradas pelo WhatsApp no site ou nos encaixes), com histórico resumido.
export const metadata = { title: 'Clientes · Painel do studio' };

export default async function ClientesPage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const tz = studio.timezone;
  const todas = await carregarClientes(supabase, studio.id);
  const mesAtual = new Date().getMonth() + 1;
  const busca = norm(sp?.q).trim();
  const lista = todas.filter((c) => !busca || norm(c.name).includes(busca) || c.phone.includes(busca.replace(/\D/g, '') || '§'));

  return (
    <>
      <h1 className="titulo">Clientes</h1>
      <p className="muted">
        {todas.length} {todas.length === 1 ? 'cliente cadastrada' : 'clientes cadastradas'}. Quem agenda pelo site entra aqui pelo WhatsApp e, na próxima vez, é reconhecida sem digitar o nome.
      </p>
      <Retorno sp={sp} />
      <form className="busca" action="/clientes" method="get">
        <input name="q" defaultValue={sp?.q || ''} placeholder="Buscar por nome ou WhatsApp" aria-label="Buscar cliente" />
        <button className="btn btn--mini" type="submit">Buscar</button>
      </form>
      {lista.length ? (
        <ul className="lista lista--compacta lista--grade">
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
                {aniversario(c) ? (
                  <span className={c.birth_month === mesAtual ? 'cliente__niver cliente__niver--mes' : 'cliente__niver'}>🎂 {aniversario(c)}</span>
                ) : null}
              </p>
              {c.proximo ? (
                <Link className="link" href={`/agenda?dia=${diaDe(c.proximo.starts_at, tz)}`}>
                  Próximo: {c.proximo.service_name} · {diaCurto(c.proximo.starts_at, tz)} às {hora(c.proximo.starts_at, tz)}
                  {c.proximo.status === 'pending' ? ' (aguardando sinal)' : ''}
                </Link>
              ) : null}
              <details className="cliente__editar">
                <summary>{aniversario(c) ? 'Alterar aniversário' : 'Anotar aniversário'}</summary>
                <form action={salvarAniversario} className="cliente__niver-form">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="voltar" value={busca ? `/clientes?q=${encodeURIComponent(sp.q)}` : '/clientes'} />
                  <select name="dia" defaultValue={c.birth_day || ''} aria-label="Dia do aniversário">
                    <option value="">Dia</option>
                    {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                  </select>
                  <select name="mes" defaultValue={c.birth_month || ''} aria-label="Mês do aniversário">
                    <option value="">Mês</option>
                    {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <button className="btn btn--mini btn--primario" type="submit">Salvar</button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <p className="vazio">{busca ? 'Nenhuma cliente encontrada.' : 'Nenhuma cliente cadastrada ainda.'}</p>
      )}
    </>
  );
}
