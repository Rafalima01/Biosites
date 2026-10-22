// Monta o HTML da página a partir da config do site. Executado pelo Vite
// (plugin em vite.config.js) no dev e no build, então a página chega pronta ao navegador.
import { esc, attrs } from './lib/html.js';
import { plain } from './lib/i18n.js';
import { Header } from './components/Header.js';
import { Profile } from './components/Profile.js';
import { Services, Portfolio } from './components/Sections.js';
import { Footer } from './components/Footer.js';

export { site } from './sites/index.js';

// Aplica tema e idioma salvos antes da pintura, evitando "piscar" o tema errado.
// A URL também aceita ?lang=en e ?theme=light (útil para compartilhar o link já no idioma/tema).
const bootScript = (site) => `<script>(function(d){var h=d.documentElement,q=new URLSearchParams(location.search),t,l;h.classList.add('js');try{t=localStorage.getItem('vx-theme');l=localStorage.getItem('vx-lang');}catch(e){}t=q.get('theme')||t;l=q.get('lang')||l;h.dataset.theme=(t==='light'||t==='dark')?t:'${site.defaultTheme}';if(l==='en'||l==='pt')h.dataset.lang=l;})(document)</script>`;

function renderHead(site) {
  const { meta, theme } = site;
  const base = (meta.siteUrl || '').replace(/\/$/, '');
  const ogImage = /^https?:/.test(meta.ogImage || '') ? meta.ogImage : `${base}${meta.ogImage || ''}`;
  return [
    `<title>${esc(plain(meta.title))}</title>`,
    `<meta ${attrs({ name: 'description', content: plain(meta.description) })}>`,
    `<meta ${attrs({ name: 'theme-color', content: meta.themeColor })}>`,
    base ? `<link ${attrs({ rel: 'canonical', href: `${base}/` })}>` : '',
    base ? `<meta ${attrs({ property: 'og:url', content: `${base}/` })}>` : '',
    `<meta ${attrs({ property: 'og:title', content: plain(meta.title) })}>`,
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

function renderBody(site) {
  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="page" data-site="${esc(site.id)}" data-i18n-title="${esc(JSON.stringify(site.meta.title))}">
    ${Header(site)}
    <main id="conteudo">
      <div class="col col--intro">${Profile(site)}</div>
      <div class="col col--content">
        ${Services(site)}
        ${Portfolio(site)}
      </div>
    </main>
    ${Footer(site)}
  </div>
  <div class="toast" role="status" aria-live="polite"></div>`;
}

export const renderPage = (site) => ({ lang: 'pt-BR', head: renderHead(site), body: renderBody(site) });
