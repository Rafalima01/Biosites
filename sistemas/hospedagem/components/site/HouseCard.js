'use client';
import { useRef } from 'react';
import { Icon } from '@/components/Icon';
import { PickButton } from './PickButton';
import { brl, plural, whatsappUrl } from '@/lib/format';

function Facts({ house }) {
  return (
    <ul className="facts">
      <li><Icon name="users" size={17} />{plural(house.guests, 'hóspede', 'hóspedes')}</li>
      <li><Icon name="bed" size={17} />{plural(house.bedrooms, 'quarto', 'quartos')}</li>
      <li><Icon name="bath" size={17} />{plural(house.baths, 'banheiro', 'banheiros')}</li>
    </ul>
  );
}

export function HouseCard({ house, whatsapp }) {
  const dialog = useRef(null);
  const photos = house.house_photos || [];
  const cover = photos[0];
  const open = () => {
    dialog.current?.showModal();
    document.documentElement.classList.add('has-sheet');
  };
  const close = () => dialog.current?.close();
  const ask = whatsappUrl(whatsapp, `Olá! Vim pelo site e quero saber mais sobre a ${house.name}.`);

  return (
    <article className="house-card">
      <button className="house-card__media" type="button" onClick={open} aria-label={`Ver fotos e detalhes da ${house.name}`}>
        {cover ? <img className="house-card__img" src={cover.url} alt={cover.alt || house.name} loading="lazy" /> : <span className="photo-empty"><Icon name="home" size={40} /></span>}
        {house.tag ? <span className="pill">{house.tag}</span> : null}
        {photos.length ? <span className="house-card__count"><Icon name="search" size={14} />{photos.length} fotos</span> : null}
      </button>
      <div className="house-card__body">
        <h3 className="house-card__name">{house.name}</h3>
        <p className="house-card__place"><Icon name="pin" size={15} />{house.location}</p>
        <Facts house={house} />
        <div className="house-card__foot">
          <p className="price"><span>A partir de</span><strong>{brl(house.price)}<small>/noite</small></strong></p>
          <PickButton houseId={house.id} className="btn btn--primary btn--sm">Reservar</PickButton>
        </div>
      </div>

      <dialog
        className="sheet"
        ref={dialog}
        aria-label={house.name}
        onClose={() => document.documentElement.classList.remove('has-sheet')}
        onClick={(e) => e.target === dialog.current && close()}
      >
        <div className="sheet__panel">
          <button className="sheet__close" type="button" onClick={close} aria-label="Fechar"><Icon name="close" size={20} /></button>
          {photos.length ? (
            <ul className="sheet__gallery" aria-label={`Fotos da ${house.name}`}>
              {photos.map((p) => <li key={p.id}><img className="sheet__photo" src={p.url} alt={p.alt || house.name} loading="lazy" /></li>)}
            </ul>
          ) : null}
          <div className="sheet__body">
            <p className="eyebrow">{house.location}</p>
            <h2 className="sheet__title">{house.name}</h2>
            <Facts house={house} />
            {house.description ? <p className="sheet__text">{house.description}</p> : null}
            {house.amenities?.length ? (
              <>
                <h3 className="sheet__subtitle">O que a casa oferece</h3>
                <ul className="amenities">{house.amenities.map((a) => <li key={a}><Icon name="check" size={16} />{a}</li>)}</ul>
              </>
            ) : null}
            <h3 className="sheet__subtitle">Valores</h3>
            <dl className="rates">
              <div><dt>Diária</dt><dd>{brl(house.price)}</dd></div>
              <div><dt>Sexta e sábado</dt><dd>{brl(house.weekend_price ?? house.price)}</dd></div>
              <div><dt>Taxa de limpeza</dt><dd>{brl(house.cleaning_fee)}</dd></div>
              <div><dt>Estadia mínima</dt><dd>{plural(house.min_nights, 'noite', 'noites')}</dd></div>
            </dl>
          </div>
          <div className="sheet__actions">
            {ask ? <a className="btn btn--ghost" href={ask} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} />Tirar dúvida</a> : <span />}
            <PickButton houseId={house.id} className="btn btn--primary" onPicked={close}>Ver datas e reservar</PickButton>
          </div>
        </div>
      </dialog>
    </article>
  );
}
