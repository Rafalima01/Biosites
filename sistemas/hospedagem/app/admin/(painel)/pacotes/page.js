import { getAdmin } from '@/lib/supabase/server';
import { today, toDay, formatDate } from '@/lib/dates';
import { brl } from '@/lib/format';
import { savePackage, deletePackage } from '../../actions';
import { ActionButton, ActionForm } from '@/components/admin/ui';
import { Icon } from '@/components/Icon';

export default async function Pacotes({ searchParams }) {
  const { editar } = await searchParams;
  const { supabase } = await getAdmin();
  const [{ data: houses }, { data: packages }] = await Promise.all([
    supabase.from('houses').select('id, name').order('sort'),
    supabase.from('packages').select('*').order('starts_on'),
  ]);
  const t = today();
  const editing = packages?.find((p) => p.id === editar);
  const e = editing || { active: true };

  return (
    <>
      <header className="admin__head">
        <div>
          <p className="eyebrow">Pacotes</p>
          <h1 className="admin__title">Pacotes de datas especiais</h1>
        </div>
      </header>
      <div className="admin__cols">
        <section className="panel">
          <h2 className="panel__title">{editing ? 'Editar pacote' : 'Novo pacote'}</h2>
          <p className="panel__hint">Valor fechado para um período (Réveillon, Carnaval, feriados). Essas noites saem da reserva avulsa e só podem ser reservadas pelo pacote.</p>
          {houses?.length ? (
            <ActionForm action={savePackage} resetOnSuccess={!editing} submitLabel={editing ? 'Salvar' : 'Criar pacote'}>
              <input type="hidden" name="id" value={editing?.id || ''} />
              <div className="grid2">
                <label className="field">Título<input name="title" required defaultValue={e.title || ''} placeholder="Virada pé na areia" /></label>
                <label className="field">Selo<input name="tag" defaultValue={e.tag || ''} placeholder="Réveillon" maxLength={24} /></label>
              </div>
              <label className="field">Casa
                <select name="house_id" required defaultValue={e.house_id || houses[0].id}>
                  {houses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </label>
              <div className="grid3">
                <label className="field">Entrada<input type="date" name="starts_on" required defaultValue={e.starts_on || ''} /></label>
                <label className="field">Saída<input type="date" name="ends_on" required defaultValue={e.ends_on || ''} /></label>
                <label className="field">Valor fechado (R$)<input name="price" inputMode="decimal" required defaultValue={e.price || ''} /></label>
              </div>
              <label className="field">O que está incluso<textarea name="note" rows={2} defaultValue={e.note || ''} /></label>
              <label className="field">Link da foto <small>(opcional)</small><input name="photo_url" type="url" defaultValue={e.photo_url || ''} placeholder="https://…" /></label>
              <label className="check"><input type="checkbox" name="active" defaultChecked={e.active} /><span>Mostrar no site</span></label>
            </ActionForm>
          ) : <p className="empty">Cadastre uma casa primeiro.</p>}
          {editing ? <a className="panel__link" href="/admin/pacotes">Cancelar edição</a> : null}
        </section>

        <section className="panel">
          <h2 className="panel__title">Pacotes cadastrados</h2>
          {packages?.length ? (
            <ul className="rows">
              {packages.map((p) => (
                <li className={`row${toDay(p.ends_on) < t ? ' is-past' : ''}`} key={p.id}>
                  <div>
                    <strong>{p.title} · {brl(p.price)}</strong>
                    <span>{houses?.find((h) => h.id === p.house_id)?.name} · {formatDate(p.starts_on)} a {formatDate(p.ends_on)}{p.active ? '' : ' · oculto'}{toDay(p.ends_on) < t ? ' · encerrado' : ''}</span>
                  </div>
                  <div className="row__tools">
                    <a className="btn btn--ghost btn--sm" href={`/admin/pacotes?editar=${p.id}`}><Icon name="edit" size={16} /></a>
                    <ActionButton action={deletePackage} args={[p.id]} confirm="Apagar este pacote? Reservas já feitas continuam valendo."><Icon name="trash" size={16} /></ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="empty">Nenhum pacote ainda.</p>}
        </section>
      </div>
    </>
  );
}
