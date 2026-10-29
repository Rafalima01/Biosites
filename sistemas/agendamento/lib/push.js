import webpush from 'web-push';

// Envia um aviso para vários celulares. Chaves VAPID só nas variáveis da Vercel.
// Devolve quantos foram entregues e quais celulares não existem mais (app removido).
export async function enviarAvisos(inscricoes, aviso) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'https://sistema-agendamento-sand.vercel.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
  const corpo = JSON.stringify({ title: aviso.title, body: aviso.body, url: aviso.url || '/', tag: aviso.tag || undefined });
  const removidos = [];
  let enviados = 0;
  await Promise.all(
    inscricoes.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, corpo, { TTL: 60 * 60, urgency: 'high' });
        enviados++;
      } catch (e) {
        if (e?.statusCode === 404 || e?.statusCode === 410) removidos.push(s.endpoint);
      }
    }),
  );
  return { enviados, removidos };
}
