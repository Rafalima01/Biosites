'use client';
import { useState } from 'react';

export function PromoKindFields({ kind: initialKind = 'percent', value = '' }) {
  const [kind, setKind] = useState(initialKind);
  return (
    <div className="grid2">
      <label className="field">Tipo
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="percent">Desconto em %</option>
          <option value="price">Diária fixa (R$)</option>
        </select>
      </label>
      <label className="field">{kind === 'percent' ? 'Desconto (%)' : 'Valor da diária (R$)'}
        <input name="value" inputMode="decimal" required defaultValue={value} placeholder={kind === 'percent' ? '20' : '1490'} />
      </label>
    </div>
  );
}
