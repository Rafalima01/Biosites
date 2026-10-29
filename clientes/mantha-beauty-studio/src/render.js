// Monta o HTML de cada página a partir da config do site. Executado pelo Vite
// (plugin em vite.config.js) no dev e no build, então a página chega pronta ao navegador.
import { esc, attrs } from './lib/html.js';
import { StudioCard, ServicesLinkCard, InspoCard, ContactCard, ServicesPage, Footer } from './components/Cards.js';
import { Picture } from './components/Picture.js';

export { site } from './sites/index.js';

function renderHead(site, page) {
  const { theme } = site;
  // Páginas internas podem trocar título e descrição (site.pages.<página>.meta).
  const meta = { ...site.meta, ...(site.pages?.[page]?.meta || {}) };
  const tokens = Object.entries(theme.tokens || {})
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  const base = (meta.siteUrl || '').replace(/\/$/, '');
  const path = page === 'home' ? '/' : `/${page}/`;
  const ogImage = /^https?:/.test(meta.ogImage || '') ? meta.ogImage : `${base}${meta.ogImage || ''}`;
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta ${attrs({ name: 'description', content: meta.description })}>`,
    `<meta ${attrs({ name: 'theme-color', content: meta.themeColor })}>`,
    base ? `<link ${attrs({ rel: 'canonical', href: `${base}${path}` })}>` : '',
    base ? `<meta ${attrs({ property: 'og:url', content: `${base}${path}` })}>` : '',
    `<meta ${attrs({ property: 'og:title', content: meta.title })}>`,
    `<meta ${attrs({ property: 'og:description', content: meta.description })}>`,
    meta.ogImage ? `<meta ${attrs({ property: 'og:image', content: ogImage })}>` : '',
    `<meta property="og:type" content="website">`,
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link ${attrs({ rel: 'stylesheet', href: theme.fontsHref })}>`,
    tokens ? `<style>:root{${esc(tokens)}}</style>` : '',
    `<script>document.documentElement.classList.add('js')</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');
}

// Conteúdo de cada página. Os serviços ficam numa página própria para o início não ficar longo.
// No início, as duas colunas do desktop viram uma lista só no celular (ordem em base.css).
const PAGINAS = {
  home: (site) => `<div class="stack">
      ${StudioCard(site)}
      ${ContactCard(site)}
    </div>
    <div class="stack stack--offset">
      ${ServicesLinkCard(site)}
      ${InspoCard(site)}
    </div>`,
  servicos: (site) => ServicesPage(site),
};

function renderBody(site, page) {
  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="backdrop${site.backdrop.blur ? ' backdrop--blur' : ''}" aria-hidden="true">${Picture(site.backdrop, { className: 'backdrop__img', sizes: '100vw', priority: true })}</div>
  <main class="page page--${page}" id="conteudo" data-site="${esc(site.id)}">
    ${PAGINAS[page](site)}
  </main>
  ${Footer(site)}
  <div class="toast" role="status" aria-live="polite"></div>`;
}

/** `page`: 'home' (início) ou 'servicos'. */
export const renderPage = (site, page = 'home') => ({ lang: site.lang, head: renderHead(site, page), body: renderBody(site, page) });
