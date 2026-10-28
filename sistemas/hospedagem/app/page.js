import { cache } from 'react';
import { supabaseServer } from '@/lib/supabase/server';
import { loadSettings } from '@/lib/settings';
import { toISO, today } from '@/lib/dates';
import { Theme } from '@/components/site/Theme';
import { Topbar, Hero, Tabs, Perks, Packages, Testimonials, Faq, Contact, Footer } from '@/components/site/Sections';
import { HouseCard } from '@/components/site/HouseCard';
import { BookingWidget } from '@/components/site/BookingWidget';

export const dynamic = 'force-dynamic';

const loadSite = cache(async () => {
  const supabase = await supabaseServer();
  const todayIso = toISO(today());
  const [settings, houses, packages, promotions] = await Promise.all([
    loadSettings(supabase),
    supabase.from('houses').select('*, house_photos(*)').eq('active', true).order('sort').order('created_at'),
    supabase.from('packages').select('*').eq('active', true).gte('starts_on', todayIso).order('starts_on'),
    supabase.from('promotions').select('*').eq('active', true).gte('ends_on', todayIso),
  ]);
  const list = (houses.data || []).map((h) => ({
    ...h,
    house_photos: [...(h.house_photos || [])].sort((a, b) => a.sort - b.sort),
  }));
  return { settings, houses: list, packages: packages.data || [], promotions: promotions.data || [] };
});

export async function generateMetadata() {
  const { settings } = await loadSite();
  const title = `${settings.brand.name} · ${settings.brand.tagline}`;
  const description = settings.hero.text || `Reserve direto com ${settings.brand.name}.`;
  return { title, description, openGraph: { title, description, images: settings.hero.photo ? [settings.hero.photo] : [] } };
}

export default async function Home() {
  const { settings, houses, packages, promotions } = await loadSite();
  const rating = settings.hero.stats?.find((s) => /avalia/i.test(s.label))?.value;
  return (
    <>
      <Theme theme={settings.theme} />
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="page">
        <Topbar brand={settings.brand} />
        <main id="conteudo">
          <Hero hero={settings.hero} />
          <Tabs hasPackages={packages.length > 0} hasFaq={settings.faq.length > 0} />
          <section className="section" id="casas" aria-labelledby="casas-title">
            <div className="section__head">
              <p className="eyebrow">Acomodações</p>
              <h2 className="section__title" id="casas-title">Escolha sua casa</h2>
            </div>
            <div className="rail">
              {houses.map((h) => <HouseCard key={h.id} house={h} whatsapp={settings.contact.whatsapp} />)}
            </div>
          </section>
          <Perks perks={settings.perks} />
          <Packages packages={packages} houses={houses} />
          <section className="section booking" id="agenda" aria-labelledby="agenda-title">
            <div className="section__head">
              <p className="eyebrow">Agenda e disponibilidade</p>
              <h2 className="section__title" id="agenda-title">Planeje sua estadia</h2>
              <p className="section__lead">Toque na data de entrada e depois na de saída. O valor aparece na hora.</p>
            </div>
            <BookingWidget houses={houses} promotions={promotions} packages={packages} booking={settings.booking} whatsapp={settings.contact.whatsapp} />
          </section>
          <Testimonials items={settings.testimonials} rating={rating} />
          <Faq items={settings.faq} />
          <Contact settings={settings} />
        </main>
        <Footer settings={settings} />
      </div>
    </>
  );
}
