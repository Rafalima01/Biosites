// Chamada pelo banco (pg_net) quando há aviso para mandar. Confere o segredo, entrega os avisos
// e tira da lista os celulares que desinstalaram o app.
import { enviarAvisos } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const segredo = process.env.PUSH_SECRET;
  if (!segredo || request.headers.get('x-push-secret') !== segredo) return new Response('negado', { status: 401 });
  const dados = await request.json().catch(() => null);
  if (!dados?.title || !Array.isArray(dados.subscriptions)) return new Response('dados inválidos', { status: 400 });

  const { enviados, removidos } = await enviarAvisos(dados.subscriptions.slice(0, 50), dados);
  if (removidos.length) {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/push_remove`, {
      method: 'POST',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_secret: segredo, p_endpoints: removidos }),
    }).catch(() => undefined);
  }
  return Response.json({ enviados, removidos: removidos.length });
}
