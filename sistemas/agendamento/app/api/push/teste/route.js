// "Testar aviso" no painel: manda um aviso para os celulares do studio de quem está logado.
import { getPainel } from '@/lib/supabase/server';
import { enviarAvisos } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const { supabase, studio } = await getPainel();
  if (!studio) return new Response('negado', { status: 401 });
  const { data } = await supabase.from('push_subscriptions').select('endpoint, p256dh, auth').eq('studio_id', studio.id);
  const lista = (data || []).map((s) => ({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }));
  if (!lista.length) return Response.json({ enviados: 0 });
  const r = await enviarAvisos(lista, { title: 'Avisos ativados ✨', body: `Você vai receber os agendamentos do ${studio.name} aqui.`, url: '/', tag: 'teste' });
  if (r.removidos.length) await supabase.from('push_subscriptions').delete().in('endpoint', r.removidos);
  return Response.json(r);
}
