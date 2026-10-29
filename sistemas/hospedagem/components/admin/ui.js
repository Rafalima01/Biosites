'use client';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';

/** Formulário ligado a uma Server Action, com aviso de sucesso/erro. */
export function ActionForm({ action, children, className = 'admin-form', resetOnSuccess = false, submitLabel = 'Salvar' }) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <div className="admin-form__foot">
        {state ? <p className={state.ok ? 'notice notice--ok' : 'notice notice--error'} role="status">{state.message}</p> : <span />}
        <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? 'Salvando…' : submitLabel}</button>
      </div>
    </form>
  );
}

/** Botão que chama uma Server Action (com confirmação opcional) e mostra o resultado. */
export function ActionButton({ action, args = [], confirm, className = 'btn btn--ghost btn--sm', children, title }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState(null);
  const router = useRouter();
  return (
    <>
      <button
        type="button"
        className={className}
        disabled={pending}
        title={title}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => {
            const res = await action(...args);
            if (res && !res.ok) setMsg(res);
            else if (res?.message) setMsg(res);
            router.refresh();
            setTimeout(() => setMsg(null), 4000);
          });
        }}
      >
        {pending ? '…' : children}
      </button>
      {msg ? <span className={msg.ok ? 'notice notice--ok notice--inline' : 'notice notice--error notice--inline'} role="status">{msg.message}</span> : null}
    </>
  );
}

/**
 * Editor de lista (vantagens, depoimentos, perguntas, números do topo).
 * Guarda o resultado como JSON num campo escondido `name`.
 */
export function ListEditor({ name, fields, initial = [], addLabel = 'Adicionar' }) {
  const [rows, setRows] = useState(() => (initial.length ? initial : []));
  const update = (i, key, value) => setRows((r) => r.map((row, k) => (k === i ? { ...row, [key]: value } : row)));
  const move = (i, d) =>
    setRows((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const copy = [...r];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  return (
    <div className="list-editor">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {rows.map((row, i) => (
        <div className="list-editor__row" key={i}>
          <div className="list-editor__fields">
            {fields.map((f) =>
              f.type === 'textarea' ? (
                <label className="field" key={f.key}>{f.label}<textarea rows={2} value={row[f.key] || ''} onChange={(e) => update(i, f.key, e.target.value)} /></label>
              ) : f.type === 'select' ? (
                <label className="field" key={f.key}>{f.label}
                  <select value={row[f.key] || f.options[0][0]} onChange={(e) => update(i, f.key, e.target.value)}>
                    {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </label>
              ) : (
                <label className="field" key={f.key}>{f.label}<input value={row[f.key] || ''} onChange={(e) => update(i, f.key, e.target.value)} /></label>
              ),
            )}
          </div>
          <div className="list-editor__tools">
            <button type="button" className="icon-btn" onClick={() => move(i, -1)} aria-label="Subir"><Icon name="chevronLeft" size={16} className="icon rot90" /></button>
            <button type="button" className="icon-btn" onClick={() => move(i, 1)} aria-label="Descer"><Icon name="chevronRight" size={16} className="icon rot90" /></button>
            <button type="button" className="icon-btn" onClick={() => setRows((r) => r.filter((_, k) => k !== i))} aria-label="Remover"><Icon name="trash" size={16} /></button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setRows((r) => [...r, {}])}><Icon name="plus" size={16} />{addLabel}</button>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = { pending: ['Aguardando Pix', 'pending'], confirmed: ['Confirmada', 'ok'], cancelled: ['Cancelada', 'off'], expired: ['Expirada', 'off'] };
  const [label, tone] = map[status] || [status, 'off'];
  return <span className={`badge badge--${tone}`}>{label}</span>;
}
