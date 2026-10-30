import Link from 'next/link';
import { getPainel } from '@/lib/supabase/server';
import { Aniversariantes } from '@/components/Aniversariantes';
import { MESES, carregarClientes } from '@/lib/clientes';

export const metadata = { title: 'Aniversariantes · Painel do studio' };

const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Aniversariantes do mês, com o WhatsApp já com a mensagem de parabéns (promoção, mimo...).
export default async function AniversariosPage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const atual = new Date().getMonth() + 1;
  const mes = Number(sp?.mes) >= 1 && Number(sp?.mes) <= 12 ? Number(sp.mes) : atual;
  const todas = await carregarClientes(supabase, studio.id);
  const doMes = todas.filter((c) => c.birth_month === mes).sort((a, b) => a.birth_day - b.birth_day);
  const semData = todas.filter((c) => !c.birth_month).length;
  const ir = (m) => `/clientes/aniversarios?mes=${((m + 11) % 12) + 1}`;

  return (
    <div className="fin fin--niver">
      <div className="dia fin__topo">
        <Link className="btn btn--mini" href={ir(mes - 1)} aria-label="Mês anterior">‹</Link>
        <div className="dia__nome">
          <p className="kicker">Aniversariantes</p>
          <h1 className="titulo">{maiuscula(MESES[mes - 1])}</h1>
          {mes === atual ? null : <Link className="link" href="/clientes/aniversarios">Voltar para este mês</Link>}
        </div>
        <Link className="btn btn--mini" href={ir(mes + 1)} aria-label="Próximo mês">›</Link>
      </div>

      <p className="muted">
        {doMes.length} {doMes.length === 1 ? 'cliente faz' : 'clientes fazem'} aniversário em {MESES[mes - 1]}.
        {semData ? ` ${semData} ${semData === 1 ? 'cliente ainda não tem' : 'clientes ainda não têm'} aniversário anotado (dá para anotar em Clientes).` : ''}
      </p>

      <Aniversariantes
        clientes={doMes.map(({ id, name, phone, birth_day, atendimentos, favorito }) => ({ id, name, phone, birth_day, atendimentos, favorito }))}
        studio={studio.name}
        mesAtual={mes === atual}
      />
    </div>
  );
}
