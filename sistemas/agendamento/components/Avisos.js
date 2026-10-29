'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

const CHAVE = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

const paraBytes = (base64) => {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const bin = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const instalado = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

/**
 * Cartão para ligar os avisos no celular. No iPhone, só funciona com o painel instalado na tela
 * inicial (exigência da Apple); então, antes disso, o cartão ensina a instalar.
 */
export function Avisos({ studioId, email }) {
  const [estado, setEstado] = useState('carregando'); // carregando | instalar | pronto | ativo | bloqueado | sem-suporte
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      if (!('serviceWorker' in navigator)) return setEstado('sem-suporte');
      const reg = await navigator.serviceWorker.register('/sw.js').catch(() => null);
      if (!('PushManager' in window) || !('Notification' in window) || !reg) return setEstado(ehIOS() && !instalado() ? 'instalar' : 'sem-suporte');
      if (Notification.permission === 'denied') return setEstado('bloqueado');
      const sub = await reg.pushManager.getSubscription();
      setEstado(sub && Notification.permission === 'granted' ? 'ativo' : 'pronto');
    })();
  }, []);

  async function ativar() {
    setMsg('');
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== 'granted') return setEstado(permissao === 'denied' ? 'bloqueado' : 'pronto');
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: paraBytes(CHAVE) }));
      const j = sub.toJSON();
      const { error } = await supabaseBrowser()
        .from('push_subscriptions')
        .upsert({ studio_id: studioId, email, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, user_agent: navigator.userAgent.slice(0, 200) }, { onConflict: 'endpoint' });
      if (error) throw error;
      setEstado('ativo');
      await testar();
    } catch {
      setMsg('Não foi possível ativar agora. Tente de novo.');
    }
  }

  async function testar() {
    setMsg('Enviando um aviso de teste…');
    const r = await fetch('/api/push/teste', { method: 'POST' }).then((x) => x.json()).catch(() => null);
    setMsg(r?.enviados ? 'Aviso de teste enviado. Confira a notificação no celular.' : 'Não chegou nenhum aviso. Tente ativar de novo.');
  }

  if (estado === 'carregando' || estado === 'sem-suporte') return null;

  if (estado === 'ativo') {
    return (
      <div className="avisos avisos--ok">
        <span>🔔 Avisos ligados neste celular</span>
        <button className="btn btn--mini btn--fantasma" type="button" onClick={testar}>Testar</button>
        {msg ? <p className="muted avisos__msg">{msg}</p> : null}
      </div>
    );
  }

  return (
    <div className="card avisos">
      <p className="avisos__titulo">🔔 Receba os agendamentos no celular</p>
      {estado === 'instalar' ? (
        <ol className="avisos__passos">
          <li>Toque em <strong>Compartilhar</strong> (o quadrado com a seta) no Safari.</li>
          <li>Escolha <strong>Adicionar à Tela de Início</strong>.</li>
          <li>Abra a <strong>Agenda</strong> pelo ícone e toque em <strong>Ativar avisos</strong> aqui.</li>
        </ol>
      ) : estado === 'bloqueado' ? (
        <p className="muted">As notificações estão bloqueadas para este app. Libere em <strong>Ajustes → Notificações → Agenda</strong> (iPhone) ou nas configurações do navegador e volte aqui.</p>
      ) : (
        <>
          <p className="muted">Aviso na hora de cada novo agendamento aguardando sinal e um lembrete 30 minutos antes de cada atendimento.</p>
          <button className="btn btn--primario btn--bloco" type="button" onClick={ativar}>Ativar avisos</button>
        </>
      )}
      {msg ? <p className="muted avisos__msg">{msg}</p> : null}
    </div>
  );
}
