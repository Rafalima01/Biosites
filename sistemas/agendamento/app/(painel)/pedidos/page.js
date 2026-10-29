import { getPainel } from '@/lib/supabase/server';
import { Atendimento, Retorno } from '@/components/Atendimento';
import { hora } from '@/lib/datas';

// Agendamentos do site aguardando o sinal (os que ainda seguram o horário e os que venceram há pouco).
export default async function PedidosPage({ searchParams }) {
  const sp = await searchParams;
  const { supabase, studio } = await getPainel();
  const desde = new Date(Date.now() - 2 * 86400000).toISOString();
  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('studio_id', studio.id)
    .eq('status', 'pending')
    .gte('expires_at', desde)
    .order('starts_at');
  const lista = data || [];
  const agora = new Date();
  const segurando = lista.filter((a) => new Date(a.expires_at) > agora);
  const vencidos = lista.filter((a) => new Date(a.expires_at) <= agora);

  return (
    <>
      <h1 className="titulo">Aguardando sinal</h1>
      <p className="muted">Quando o Pix cair, toque em <strong>Confirmar sinal</strong>. Sem confirmação, o horário volta a ficar livre no site ao fim do prazo.</p>
      <Retorno sp={sp} />
      {segurando.length ? (
        <ul className="lista">
          {segurando.map((a) => (
            <Atendimento key={a.id} a={a} tz={studio.timezone} studio={studio.name} voltar="/pedidos" mostrarDia nota={`Segura o horário até ${hora(a.expires_at, studio.timezone)}`} />
          ))}
        </ul>
      ) : (
        <p className="vazio">Nenhum agendamento esperando o sinal.</p>
      )}
      {vencidos.length ? (
        <>
          <h2 className="subtitulo">Prazo vencido (últimos 2 dias)</h2>
          <p className="muted">O horário já foi liberado no site. Se a cliente pagou depois, confirme: o sistema só aceita se o horário continuar livre.</p>
          <ul className="lista">
            {vencidos.map((a) => (
              <Atendimento key={a.id} a={a} tz={studio.timezone} studio={studio.name} voltar="/pedidos" mostrarDia />
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}
