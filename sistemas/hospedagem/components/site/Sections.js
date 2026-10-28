import { Icon, LogoMark } from '@/components/Icon';
import { PickButton } from './PickButton';
import { brl, richParts, whatsappUrl, instagramUrl } from '@/lib/format';
import { formatDate, toDay } from '@/lib/dates';

const Rich = ({ text }) => richParts(text).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : <span key={i}>{p.text}</span>));

export function Topbar({ brand }) {
  return (
    <header className="topbar">
      <a className="topbar__brand" href="#inicio">
        <LogoMark size={34} />
        <span><strong>{brand.name}</strong><small>{brand.tagline}</small></span>
      </a>
      <a className="btn btn--primary btn--sm" href="#agenda">Reservar</a>
    </header>
  );
}

export function Hero({ hero }) {
  return (
    <>
      <section className="hero" id="inicio">
        <div className="hero__media">
          {hero.photo ? <img className="hero__img" src={hero.photo} alt="" fetchPriority="high" /> : null}
        </div>
        <div className="hero__content">
          {hero.badge ? <p className="hero__badge"><Icon name="tag" size={16} />{hero.badge}</p> : null}
          {hero.eyebrow ? <p className="hero__eyebrow">{hero.eyebrow}</p> : null}
          <h1 className="hero__title"><Rich text={hero.title} /></h1>
          {hero.text ? <p className="hero__text">{hero.text}</p> : null}
          {hero.stats?.length ? (
            <ul className="hero__stats" aria-label="Números">
              {hero.stats.map((s) => <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>)}
            </ul>
          ) : null}
        </div>
      </section>
      <a className="search" href="#agenda">
        <span className="search__icon"><Icon name="search" size={20} /></span>
        <span className="search__text"><strong>Quando você vai?</strong><span>Escolha a casa, as datas e os hóspedes</span></span>
        <span className="search__go" aria-hidden="true"><Icon name="arrowRight" size={18} /></span>
      </a>
    </>
  );
}

export function Tabs({ hasPackages, hasFaq }) {
  const tabs = [
    { id: 'casas', label: 'Casas', icon: 'home' },
    hasPackages && { id: 'pacotes', label: 'Pacotes', icon: 'box' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar' },
    hasFaq && { id: 'duvidas', label: 'Dúvidas', icon: 'help' },
  ].filter(Boolean);
  return (
    <nav className="tabs" aria-label="Seções" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map((t) => <a key={t.id} className="tabs__item" href={`#${t.id}`}><Icon name={t.icon} size={22} /><span>{t.label}</span></a>)}
    </nav>
  );
}

export function Perks({ perks }) {
  if (!perks?.length) return null;
  return (
    <section className="section perks" aria-labelledby="perks-title">
      <h2 className="section__title" id="perks-title">Por que reservar direto?</h2>
      <ul className="perks__list">
        {perks.map((p) => (
          <li className="perk" key={p.title}>
            <span className="perk__icon"><Icon name={['tag', 'chat', 'gift', 'shield', 'star', 'home'].includes(p.icon) ? p.icon : 'check'} size={22} /></span>
            <div><h3>{p.title}</h3><p>{p.text}</p></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Packages({ packages, houses }) {
  if (!packages.length) return null;
  return (
    <section className="section" id="pacotes" aria-labelledby="pacotes-title">
      <div className="section__head">
        <p className="eyebrow">Datas especiais</p>
        <h2 className="section__title" id="pacotes-title">Pacotes com valor fechado</h2>
      </div>
      <div className="rail">
        {packages.map((p) => {
          const house = houses.find((h) => h.id === p.house_id);
          if (!house) return null;
          const nights = toDay(p.ends_on) - toDay(p.starts_on);
          return (
            <article className="package" key={p.id}>
              <div className="package__media">
                {p.photo_url ? <img className="package__img" src={p.photo_url} alt="" loading="lazy" /> : null}
                {p.tag ? <span className="pill">{p.tag}</span> : null}
              </div>
              <div className="package__body">
                <h3 className="package__title">{p.title}</h3>
                <p className="package__house"><Icon name="home" size={15} />{house.name} · {nights} diárias</p>
                <dl className="package__dates">
                  <div><dt>Entrada</dt><dd>{formatDate(p.starts_on)}</dd></div>
                  <div><dt>Saída</dt><dd>{formatDate(p.ends_on)}</dd></div>
                </dl>
                {p.note ? <p className="package__note">{p.note}</p> : null}
                <div className="package__foot">
                  <p className="price"><span>Valor fechado</span><strong>{brl(p.price)}</strong></p>
                  <PickButton houseId={house.id} packageId={p.id} className="btn btn--primary btn--sm">Reservar</PickButton>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Testimonials({ items, rating }) {
  if (!items?.length) return null;
  return (
    <section className="section testimonials" aria-labelledby="dep-title">
      <div className="section__head section__head--center">
        <p className="eyebrow">Depoimentos</p>
        <h2 className="section__title" id="dep-title">Quem se hospeda quer voltar</h2>
        {rating ? <p className="rating">{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" size={18} />)}<span>{rating} de média</span></p> : null}
      </div>
      <ul className="rail rail--quotes">
        {items.map((t, i) => (
          <li className="quote" key={i}>
            <Icon name="quote" size={26} className="quote__mark" />
            <blockquote>{t.quote}</blockquote>
            <p className="quote__who"><strong>{t.name}</strong><span>{t.origin}</span></p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Faq({ items }) {
  if (!items?.length) return null;
  return (
    <section className="section" id="duvidas" aria-labelledby="faq-title">
      <div className="section__head">
        <p className="eyebrow">Perguntas frequentes</p>
        <h2 className="section__title" id="faq-title">Tudo o que você precisa saber antes de reservar</h2>
      </div>
      <div className="faq">
        {items.map((f, i) => (
          <details className="faq__item" key={i}>
            <summary>{f.q}<Icon name="chevronDown" size={20} /></summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Contact({ settings }) {
  const wa = whatsappUrl(settings.contact.whatsapp, 'Olá! Vim pelo site e tenho uma dúvida.');
  const maps = settings.contact.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.contact.address)}` : '';
  if (!wa && !maps) return null;
  return (
    <section className="section contact" aria-labelledby="contato-title">
      <h2 className="section__title" id="contato-title">Ficou com alguma dúvida?</h2>
      <p>Fale direto com o anfitrião. Respondemos rápido, todos os dias.</p>
      <div className="contact__actions">
        {wa ? <a className="btn btn--light" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={20} />Chamar no WhatsApp</a> : null}
        {maps ? <a className="btn btn--outline-light" href={maps} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={20} />{settings.brand.region || 'Como chegar'}</a> : null}
      </div>
    </section>
  );
}

export function Footer({ settings }) {
  const links = [
    ['instagram', 'Instagram', instagramUrl(settings.contact.instagram)],
    ['whatsapp', 'WhatsApp', whatsappUrl(settings.contact.whatsapp)],
    ['airbnb', 'Airbnb', settings.contact.airbnb],
  ].filter(([, , href]) => href);
  return (
    <footer className="footer">
      <p className="footer__brand"><strong>{settings.brand.name}</strong> · {settings.brand.tagline}</p>
      {links.length ? (
        <ul className="footer__links" aria-label="Redes e contatos">
          {links.map(([icon, label, href]) => (
            <li key={icon}><a className="footer__link" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (abre em nova aba)`}><Icon name={icon} size={20} /></a></li>
          ))}
        </ul>
      ) : null}
      <p className="footer__legal">{new Date().getFullYear()} {settings.brand.name}. Todos os direitos reservados.</p>
      {settings.demo ? <p className="footer__demo">Site demonstrativo: marca fictícia; casas, valores, depoimentos e fotos são ilustrativos.</p> : null}
    </footer>
  );
}
