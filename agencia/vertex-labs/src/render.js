// Monta o HTML das páginas a partir da config do site. Executado pelo Vite
// (plugin em vite.config.js) no dev e no build, então as páginas chegam prontas ao navegador.
import { esc, attrs } from './lib/html.js';
import { plain } from './lib/i18n.js';
import { Header } from './components/Header.js';
import { Profile } from './components/Profile.js';
import { LinkList, PortfolioSummary } from './components/Sections.js';
import { PortfolioPage } from './components/PortfolioPage.js';
import { QuoteDialog, SystemDialog } from './components/Dialogs.js';
import { Footer } from './components/Footer.js';

export { site } from './sites/index.js';

// A URL também aceita ?lang=en e ?theme=light (útil para compartilhar o link já no idioma/tema).
const bootScript = (site) => `<script>(function(d){var h=d.documentElement,q=new URLSearchParams(location.search),t,l;h.classList.add('js');try{t=localStorage.getItem('vx-theme');l=localStorage.getItem('vx-lang');}catch(e){}t=q.get('theme')||t;l=q.get('lang')||l;h.dataset.theme=(t==='light'||t==='dark')?t:'${site.defaultTheme}';if(l==='en'||l==='pt')h.dataset.lang=l;})(document)</script>`;

/** Título de cada página nas duas línguas. */
const titleOf = (site, page) =>
  page === 'portfolio'
    ? { pt: `Portfólio · ${site.brand.name}`, en: `Portfolio · ${site.brand.name}` }
    : site.meta.title;

function renderHead(site, page) {
  const { meta, theme } = site;
  const base = (meta.siteUrl || '').replace(/\/$/, '');
  const path = page === 'portfolio' ? '/portfolio/' : '/';
  const ogImage = /^https?:/.test(meta.ogImage || '') ? meta.ogImage : `${base}${meta.ogImage || ''}`;
  const title = plain(titleOf(site, page));
  return [
    `<title>${esc(title)}</title>`,
    `<meta ${attrs({ name: 'description', content: plain(meta.description) })}>`,
    `<meta ${attrs({ name: 'theme-color', content: meta.themeColor })}>`,
    base ? `<link ${attrs({ rel: 'canonical', href: `${base}${path}` })}>` : '',
    base ? `<meta ${attrs({ property: 'og:url', content: `${base}${path}` })}>` : '',
    `<meta ${attrs({ property: 'og:title', content: title })}>`,
    `<meta ${attrs({ property: 'og:description', content: plain(meta.description) })}>`,
    meta.ogImage ? `<meta ${attrs({ property: 'og:image', content: ogImage })}>` : '',
    `<meta property="og:type" content="website">`,
    `<link rel="icon" href="/favicon.png" type="image/png">`,
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link ${attrs({ rel: 'stylesheet', href: theme.fontsHref })}>`,
    bootScript(site),
  ]
    .filter(Boolean)
    .join('\n    ');
}

function renderBody(site, page) {
  const main =
    page === 'portfolio'
      ? `<main id="conteudo" class="main--portfolio">${PortfolioPage(site)}</main>`
      : `<main id="conteudo">
      <div class="col col--intro">${Profile(site)}</div>
      <div class="col col--content">
        ${LinkList(site)}
        ${PortfolioSummary(site)}
      </div>
    </main>`;

  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="page page--${page}" id="${page === 'portfolio' ? 'topo' : 'inicio'}" data-site="${esc(site.id)}" data-i18n-title="${esc(JSON.stringify(titleOf(site, page)))}">
    ${Header(site, { back: page === 'portfolio' })}
    ${main}
    ${Footer(site)}
  </div>
  ${QuoteDialog(site)}
  ${page === 'home' ? SystemDialog(site) : ''}`;
}

/** `page`: 'home' (/) ou 'portfolio' (/portfolio/). */
export const renderPage = (site, page = 'home') => ({
  lang: 'pt-BR',
  head: renderHead(site, page),
  body: renderBody(site, page),
});
