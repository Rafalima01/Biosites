'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icon';

export function CopyButton({ text, label }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn--ghost btn--block"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          window.prompt('Copie o código abaixo:', text);
        }
        setDone(true);
        setTimeout(() => setDone(false), 2500);
      }}
    >
      <Icon name={done ? 'check' : 'copy'} size={18} />
      {done ? 'Copiado!' : label}
    </button>
  );
}
