// Monta o HTML da página a partir da config do site. Executado pelo Vite
// (plugin em vite.config.js) no dev e no build, então a página chega pronta ao navegador.
import { esc, attrs } from './lib/html.js';
import { StudioCard, InspoCard, ServicesCard, Footer } from './components/Cards.js';
import { Picture } from './components/Picture.js';

export { site } from './sites/index.js';

function renderHead(site) {
  const { meta, theme } = site;
  const tokens = Object.entries(theme.tokens || {})
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  const base = (meta.siteUrl || '').replace(/\/$/, '');
  const ogImage = /^https?:/.test(meta.ogImage || '') ? meta.ogImage : `${base}${meta.ogImage || ''}`;
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta ${attrs({ name: 'description', content: meta.description })}>`,
    `<meta ${attrs({ name: 'theme-color', content: meta.themeColor })}>`,
    base ? `<link ${attrs({ rel: 'canonical', href: `${base}/` })}>` : '',
    base ? `<meta ${attrs({ property: 'og:url', content: `${base}/` })}>` : '',
    `<meta ${attrs({ property: 'og:title', content: meta.title })}>`,
    `<meta ${attrs({ property: 'og:description', content: meta.description })}>`,
    meta.ogImage ? `<meta ${attrs({ property: 'og:image', content: ogImage })}>` : '',
    `<meta property="og:type" content="website">`,
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link rel="preconnect" href="https://images.unsplash.com">`,
    `<link ${attrs({ rel: 'stylesheet', href: theme.fontsHref })}>`,
    tokens ? `<style>:root{${esc(tokens)}}</style>` : '',
    `<script>document.documentElement.classList.add('js')</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');
}

function renderBody(site) {
  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="backdrop${site.backdrop.blur ? ' backdrop--blur' : ''}" aria-hidden="true">${Picture(site.backdrop, { className: 'backdrop__img', sizes: '100vw', priority: true })}</div>
  <main class="page" id="conteudo" data-site="${esc(site.id)}">
    <div class="stack">
      ${StudioCard(site)}
      ${site.inspo.items.length ? ServicesCard(site) : ''}
    </div>
    <div class="stack stack--offset">
      ${site.inspo.items.length ? InspoCard(site) : ServicesCard(site)}
    </div>
  </main>
  ${Footer(site)}
  <div class="toast" role="status" aria-live="polite"></div>`;
}

export const renderPage = (site) => ({ lang: site.lang, head: renderHead(site), body: renderBody(site) });
