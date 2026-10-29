import { getAdmin } from '@/lib/supabase/server';
import { today, toISO, toDay, formatDate } from '@/lib/dates';
import { brl } from '@/lib/format';
import { savePromotion, togglePromotion, deletePromotion } from '../../actions';
import { ActionButton, ActionForm } from '@/components/admin/ui';
import { PromoKindFields } from '@/components/admin/PromoKindFields';
import { Icon } from '@/components/Icon';

export default async function Promocoes({ searchParams }) {
  const { editar } = await searchParams;
  const { supabase } = await getAdmin();
  const [{ data: houses }, { data: promos }] = await Promise.all([
    supabase.from('houses').select('id, name').order('sort'),
    supabase.from('promotions').select('*').order('starts_on', { ascending: false }),
  ]);
  const t = today();
  const editing = promos?.find((p) => p.id === editar);
  const houseName = (id) => houses?.find((h) => h.id === id)?.name || 'Todas as casas';
  const current = (promos || []).filter((p) => toDay(p.ends_on) >= t);
  const past = (promos || []).filter((p) => toDay(p.ends_on) < t);

  return (
    <>
      <header className="admin__head">
        <div>
          <p className="eyebrow">Promoções</p>
          <h1 className="admin__title">Datas promocionais e preços especiais</h1>
        </div>
      </header>
      <div className="admin__cols">
        <section className="panel">
          <h2 className="panel__title">{editing ? 'Editar promoção' : 'Nova promoção'}</h2>
          <p className="panel__hint">Vale para as noites entre as duas datas (inclusive). Use desconto para promoções e diária fixa para alta temporada ou feriados.</p>
          <ActionForm action={savePromotion} resetOnSuccess={!editing} submitLabel={editing ? 'Salvar' : 'Criar promoção'}>
            <input type="hidden" name="id" value={editing?.id || ''} />
            <label className="field">Nome<input name="label" defaultValue={editing?.label || ''} placeholder="Ex.: Semana sem feriado -20%" maxLength={40} /></label>
            <label className="field">Casa
              <select name="house_id" defaultValue={editing?.house_id || ''}>
                <option value="">Todas as casas</option>
                {(houses || []).map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </label>
            <div className="grid2">
              <label className="field">Primeira noite<input type="date" name="starts_on" required defaultValue={editing?.starts_on || ''} min={editing ? undefined : toISO(t)} /></label>
              <label className="field">Última noite<input type="date" name="ends_on" required defaultValue={editing?.ends_on || ''} /></label>
            </div>
            <PromoKindFields kind={editing?.nightly_price != null ? 'price' : 'percent'} value={editing ? editing.percent_off ?? editing.nightly_price : ''} />
          </ActionForm>
          {editing ? <a className="panel__link" href="/admin/promocoes">Cancelar edição</a> : null}
        </section>

        <section className="panel">
          <h2 className="panel__title">Ativas e futuras</h2>
          {current.length ? (
            <ul className="rows">
              {current.map((p) => (
                <li className="row" key={p.id}>
                  <div>
                    <strong>{p.label} · {p.percent_off != null ? `-${Number(p.percent_off)}%` : `${brl(p.nightly_price)}/noite`}</strong>
                    <span>{houseName(p.house_id)} · {formatDate(p.starts_on)} a {formatDate(p.ends_on)}{p.active ? '' : ' · pausada'}</span>
                  </div>
                  <div className="row__tools">
                    <a className="btn btn--ghost btn--sm" href={`/admin/promocoes?editar=${p.id}`}><Icon name="edit" size={16} /></a>
                    <ActionButton action={togglePromotion} args={[p.id, !p.active]}>{p.active ? 'Pausar' : 'Ativar'}</ActionButton>
                    <ActionButton action={deletePromotion} args={[p.id]} confirm="Apagar esta promoção?"><Icon name="trash" size={16} /></ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="empty">Nenhuma promoção ativa.</p>}
          {past.length ? <p className="panel__hint">{past.length} promoção(ões) já encerrada(s).</p> : null}
        </section>
      </div>
    </>
  );
}
