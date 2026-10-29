'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { addPhotos, deletePhoto, movePhoto, updatePhoto } from '@/app/admin/actions';
import { Icon } from '@/components/Icon';

/** Reduz a foto para no máximo 1600px e converte para WebP antes de enviar. */
async function shrink(file, max = 1600) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b || file), 'image/webp', 0.82));
}

export function PhotoManager({ houseId, photos }) {
  const router = useRouter();
  const input = useRef(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const [, start] = useTransition();

  const run = (fn) =>
    start(async () => {
      setError('');
      const res = await fn();
      if (res && !res.ok) setError(res.message);
      router.refresh();
    });

  async function upload(files) {
    if (!files?.length) return;
    setError('');
    const supabase = supabaseBrowser();
    const added = [];
    let i = 0;
    for (const file of files) {
      i++;
      if (!file.type.startsWith('image/')) continue;
      setBusy(`Enviando ${i} de ${files.length}…`);
      try {
        const blob = await shrink(file);
        const path = `${houseId}/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage.from('fotos').upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('fotos').getPublicUrl(path);
        added.push({ url: data.publicUrl, path, alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') });
      } catch (e) {
        setError(`Falha ao enviar ${file.name}: ${e.message || e}`);
      }
    }
    if (added.length) {
      const res = await addPhotos(houseId, added);
      if (res && !res.ok) setError(res.message);
    }
    setBusy('');
    if (input.current) input.current.value = '';
    router.refresh();
  }

  return (
    <div className="photos">
      <label className={`dropzone${busy ? ' is-busy' : ''}`}>
        <Icon name="upload" size={28} />
        <strong>{busy || 'Adicionar fotos'}</strong>
        <span>JPG, PNG ou WebP. Pode selecionar várias de uma vez.</span>
        <input ref={input} type="file" accept="image/*" multiple disabled={Boolean(busy)} onChange={(e) => upload([...e.target.files])} />
      </label>
      <form
        className="photos__link"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^https:\/\//.test(link)) return setError('Cole um link começando com https://');
          run(async () => {
            const r = await addPhotos(houseId, [{ url: link, alt: '' }]);
            setLink('');
            return r;
          });
        }}
      >
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="ou cole o link de uma imagem" aria-label="Link da imagem" />
        <button className="btn btn--ghost btn--sm" type="submit">Adicionar</button>
      </form>
      {error ? <p className="form-error" role="alert">{error}</p> : null}

      {photos.length ? (
        <ul className="photos__grid">
          {photos.map((p, i) => (
            <li key={p.id} className="photo">
              <img src={p.url} alt={p.alt} />
              {i === 0 ? <span className="pill">Capa</span> : null}
              <input
                className="photo__alt"
                defaultValue={p.alt}
                placeholder="Descreva a foto"
                aria-label="Descrição da foto"
                onBlur={(e) => e.target.value !== p.alt && run(() => updatePhoto(p.id, houseId, { alt: e.target.value }))}
              />
              <div className="photo__tools">
                {i > 0 ? <button type="button" className="icon-btn" title="Usar como capa" onClick={() => run(() => movePhoto(houseId, p.id, 'first'))}><Icon name="star" size={15} /></button> : null}
                <button type="button" className="icon-btn" title="Mover para trás" disabled={i === 0} onClick={() => run(() => movePhoto(houseId, p.id, 'up'))}><Icon name="chevronLeft" size={16} /></button>
                <button type="button" className="icon-btn" title="Mover para frente" disabled={i === photos.length - 1} onClick={() => run(() => movePhoto(houseId, p.id, 'down'))}><Icon name="chevronRight" size={16} /></button>
                <button type="button" className="icon-btn" title="Apagar" onClick={() => window.confirm('Apagar esta foto?') && run(() => deletePhoto(p.id, houseId))}><Icon name="trash" size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">Nenhuma foto ainda. A primeira foto vira a capa do card.</p>
      )}
    </div>
  );
}
