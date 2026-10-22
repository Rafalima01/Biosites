// Monta o HTML da página a partir da config do site. Executado pelo Vite
// (plugin em vite.config.js) no dev e no build, então a página chega pronta ao navegador.
import { esc, attrs } from './lib/html.js';
import { Hero } from './components/Hero.js';
import { Features } from './components/Features.js';
import { About, Services, Testimonials, FinalCta } from './components/Sections.js';
import { Footer } from './components/Footer.js';

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
  <div class="page" data-site="${esc(site.id)}">
    <main id="conteudo" class="main">
      ${Hero(site)}
      ${Features(site)}
      ${About(site)}
      ${Services(site)}
      ${Testimonials(site)}
      ${FinalCta(site)}
    </main>
    ${Footer(site)}
  </div>
  <div class="toast" role="status" aria-live="polite"></div>`;
}

export const renderPage = (site) => ({ lang: site.lang, head: renderHead(site), body: renderBody(site) });
