import { notFound } from 'next/navigation';
import { getAdmin } from '@/lib/supabase/server';
import { saveHouse, deleteHouse } from '../../../actions';
import { ActionButton, ActionForm } from '@/components/admin/ui';
import { PhotoManager } from '@/components/admin/PhotoManager';
import { Icon } from '@/components/Icon';

export default async function CasaForm({ params, searchParams }) {
  const { id } = await params;
  const { nova } = await searchParams;
  const isNew = id === 'nova';
  const { supabase } = await getAdmin();
  let house = { active: true, guests: 4, bedrooms: 2, baths: 1, min_nights: 2, cleaning_fee: 0, amenities: [] };
  let photos = [];
  if (!isNew) {
    const { data } = await supabase.from('houses').select('*, house_photos(*)').eq('id', id).maybeSingle();
    if (!data) notFound();
    house = data;
    photos = [...(data.house_photos || [])].sort((a, b) => a.sort - b.sort || a.created_at.localeCompare(b.created_at));
  }
  // Valores com centavos aparecem no formato brasileiro (1290,5); inteiros sem casas decimais.
  const v = (k) => {
    const x = house[k];
    if (x == null) return '';
    return typeof x === 'number' || /^\d+(\.\d+)?$/.test(x) ? String(Number(x)).replace('.', ',') : x;
  };

  return (
    <>
      <header className="admin__head">
        <div>
          <p className="eyebrow"><a href="/admin/casas">Casas</a> /</p>
          <h1 className="admin__title">{isNew ? 'Nova casa' : house.name}</h1>
        </div>
        {!isNew ? (
          <ActionButton action={deleteHouse} args={[house.id]} className="btn btn--danger btn--sm" confirm={`Apagar "${house.name}"? Se houver reservas no histórico, ela será apenas ocultada.`}>
            <Icon name="trash" size={16} />Apagar
          </ActionButton>
        ) : null}
      </header>
      {nova ? <p className="notice notice--ok">Casa criada! Agora adicione as fotos abaixo.</p> : null}

      <div className="admin__cols admin__cols--wide">
        <section className="panel">
          <h2 className="panel__title">Informações</h2>
          <ActionForm action={saveHouse} submitLabel={isNew ? 'Criar casa' : 'Salvar alterações'}>
            <input type="hidden" name="id" value={isNew ? '' : house.id} />
            <div className="grid2">
              <label className="field">Nome da casa<input name="name" required defaultValue={v('name')} placeholder="Casa Coqueiros" /></label>
              <label className="field">Localização<input name="location" defaultValue={v('location')} placeholder="Imbassaí, Bahia" /></label>
            </div>
            <div className="grid2">
              <label className="field">Selo no card <small>(opcional)</small><input name="tag" defaultValue={v('tag')} placeholder="Novo, Mais reservada…" maxLength={24} /></label>
              <label className="field">Ordem no site<input name="sort" type="number" defaultValue={v('sort') || 0} /></label>
            </div>
            <label className="field">Resumo <small>(uma frase)</small><input name="summary" defaultValue={v('summary')} maxLength={140} /></label>
            <label className="field">Descrição completa<textarea name="description" rows={5} defaultValue={v('description')} /></label>

            <h3 className="panel__sub">Capacidade</h3>
            <div className="grid4">
              <label className="field">Hóspedes<input name="guests" type="number" min={1} required defaultValue={v('guests')} /></label>
              <label className="field">Quartos<input name="bedrooms" type="number" min={0} defaultValue={v('bedrooms')} /></label>
              <label className="field">Banheiros<input name="baths" type="number" min={0} defaultValue={v('baths')} /></label>
              <label className="field">Mín. noites<input name="min_nights" type="number" min={1} defaultValue={v('min_nights')} /></label>
            </div>

            <h3 className="panel__sub">Valores (R$)</h3>
            <div className="grid3">
              <label className="field">Diária<input name="price" inputMode="decimal" required defaultValue={v('price')} placeholder="980" /></label>
              <label className="field">Sexta e sábado<input name="weekend_price" inputMode="decimal" defaultValue={v('weekend_price')} placeholder="Igual à diária" /></label>
              <label className="field">Taxa de limpeza<input name="cleaning_fee" inputMode="decimal" defaultValue={v('cleaning_fee')} /></label>
            </div>
            <p className="panel__hint">Para datas promocionais ou alta temporada, use <a href="/admin/promocoes">Promoções</a>.</p>

            <label className="field">Comodidades <small>(uma por linha)</small><textarea name="amenities" rows={5} defaultValue={(house.amenities || []).join('\n')} placeholder={'Piscina\nWi-Fi\nAr-condicionado'} /></label>
            <label className="field">Endereço da página <small>(gerado do nome se vazio)</small><input name="slug" defaultValue={v('slug')} placeholder="casa-coqueiros" /></label>
            <label className="check"><input type="checkbox" name="active" defaultChecked={house.active} /><span>Mostrar esta casa no site</span></label>
          </ActionForm>
        </section>

        <section className="panel">
          <h2 className="panel__title">Fotos</h2>
          {isNew ? <p className="empty">Salve a casa primeiro para adicionar fotos.</p> : <PhotoManager houseId={house.id} photos={photos} />}
        </section>
      </div>
    </>
  );
}
