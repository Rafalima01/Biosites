'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

const CHAVE = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const FECHADO = 'avisos-fechado'; // a dona fechou o cartão: só abre de novo pelo sininho

const paraBytes = (base64) => {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const bin = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const instalado = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const lembrar = (k, v) => {
  try {
    if (v) localStorage.setItem(k, '1');
    else return localStorage.getItem(k) === '1';
  } catch {
    return false;
  }
};

const Sino = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

/**
 * Sininho no topo + cartão dos avisos no celular. O cartão abre sozinho só enquanto os avisos não
 * estão ligados e a dona não fechou no X; depois disso, abre só pelo sininho.
 * No iPhone, notificação só funciona com o painel instalado na tela inicial (exigência da Apple).
 */
export function Avisos({ studioId, email }) {
  const [estado, setEstado] = useState('carregando'); // carregando | instalar | pronto | ativo | bloqueado | sem-suporte
  const [aberto, setAberto] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      let e = 'sem-suporte';
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.register('/sw.js').catch(() => null);
        if (!('PushManager' in window) || !('Notification' in window) || !reg) e = ehIOS() && !instalado() ? 'instalar' : 'sem-suporte';
        else if (Notification.permission === 'denied') e = 'bloqueado';
        else {
          const sub = await reg.pushManager.getSubscription();
          e = sub && Notification.permission === 'granted' ? 'ativo' : 'pronto';
        }
      }
      setEstado(e);
      if (e !== 'ativo' && e !== 'sem-suporte' && !lembrar(FECHADO)) setAberto(true);
    })();
  }, []);

  function fechar() {
    lembrar(FECHADO, true);
    setAberto(false);
    setMsg('');
  }

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

  if (estado === 'carregando') return null;
  const ligado = estado === 'ativo';

  return (
    <>
      <button
        type="button"
        className={`sino${ligado ? '' : ' sino--alerta'}`}
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-label={ligado ? 'Avisos ligados' : 'Ativar avisos no celular'}
        title={ligado ? 'Avisos ligados' : 'Ativar avisos no celular'}
      >
        <Sino />
      </button>

      {aberto ? (
        <div className="card avisos" role="dialog" aria-label="Avisos no celular">
          <button type="button" className="avisos__fechar" onClick={fechar} aria-label="Fechar">×</button>
          {ligado ? (
            <>
              <p className="avisos__titulo">🔔 Avisos ligados neste celular</p>
              <p className="muted">Você recebe cada novo agendamento e um lembrete 30 minutos antes de cada atendimento.</p>
              <button className="btn btn--bloco" type="button" onClick={testar}>Enviar aviso de teste</button>
            </>
          ) : estado === 'instalar' ? (
            <>
              <p className="avisos__titulo">🔔 Receba os agendamentos no celular</p>
              <ol className="avisos__passos">
                <li>Toque em <strong>Compartilhar</strong> (o quadrado com a seta) no Safari.</li>
                <li>Escolha <strong>Adicionar à Tela de Início</strong>.</li>
                <li>Abra a <strong>Agenda</strong> pelo ícone e toque no sininho para ativar.</li>
              </ol>
            </>
          ) : estado === 'bloqueado' ? (
            <>
              <p className="avisos__titulo">🔕 Notificações bloqueadas</p>
              <p className="muted">Libere em <strong>Ajustes → Notificações → Agenda</strong> (iPhone) ou nas configurações do navegador e volte aqui.</p>
            </>
          ) : estado === 'sem-suporte' ? (
            <>
              <p className="avisos__titulo">🔔 Avisos no celular</p>
              <p className="muted">Este navegador não recebe notificações. No iPhone, abra pelo Safari e instale na tela inicial; no Android, use o Chrome.</p>
            </>
          ) : (
            <>
              <p className="avisos__titulo">🔔 Receba os agendamentos no celular</p>
              <p className="muted">Aviso na hora de cada novo agendamento e um lembrete 30 minutos antes de cada atendimento.</p>
              <button className="btn btn--primario btn--bloco" type="button" onClick={ativar}>Ativar avisos</button>
            </>
          )}
          {msg ? <p className="muted avisos__msg">{msg}</p> : null}
        </div>
      ) : null}
    </>
  );
}
