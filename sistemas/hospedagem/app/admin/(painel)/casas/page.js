import { getAdmin } from '@/lib/supabase/server';
import { brl, plural } from '@/lib/format';
import { Icon } from '@/components/Icon';

export default async function Casas() {
  const { supabase } = await getAdmin();
  const { data: houses } = await supabase.from('houses').select('*, house_photos(url, sort)').order('sort').order('created_at');
  return (
    <>
      <header className="admin__head">
        <div>
          <p className="eyebrow">Casas</p>
          <h1 className="admin__title">Suas acomodações</h1>
        </div>
        <a className="btn btn--primary btn--sm" href="/admin/casas/nova"><Icon name="plus" size={18} />Nova casa</a>
      </header>
      {houses?.length ? (
        <ul className="house-admin-list">
          {houses.map((h) => {
            const cover = [...(h.house_photos || [])].sort((a, b) => a.sort - b.sort)[0];
            return (
              <li key={h.id}>
                <a className="house-admin" href={`/admin/casas/${h.id}`}>
                  <span className="house-admin__img">{cover ? <img src={cover.url} alt="" /> : <Icon name="home" size={32} />}</span>
                  <span className="house-admin__body">
                    <strong>{h.name}</strong>
                    <span>{h.location || 'Sem localização'}</span>
                    <span>{brl(h.price)}/noite · {plural(h.guests, 'hóspede', 'hóspedes')} · {plural(h.house_photos?.length || 0, 'foto', 'fotos')}</span>
                  </span>
                  <span className={h.active ? 'badge badge--ok' : 'badge badge--off'}>{h.active ? 'No site' : 'Oculta'}</span>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty panel">Nenhuma casa ainda. <a href="/admin/casas/nova">Cadastre a primeira</a>.</p>
      )}
    </>
  );
}
