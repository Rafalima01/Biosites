// Monta o HTML de cada página a partir da config do site. Executado pelo Vite
// (plugin em vite.config.js) no dev e no build, então a página chega pronta ao navegador.
import { esc, attrs } from './lib/html.js';
import { Hero } from './components/Hero.js';
import { Features } from './components/Features.js';
import { About, Services, Location, Testimonials, FinalCta } from './components/Sections.js';
import { Footer } from './components/Footer.js';
import { Mentoria, Topbar } from './components/Paginas.js';

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

// Conteúdo de cada página. Serviços e mentoria ficam em páginas próprias para o início não ficar longo.
const PAGINAS = {
  home: (site) => `${Hero(site)}
      ${Features(site)}
      ${About(site)}
      ${Location(site)}
      ${site.testimonials ? Testimonials(site) : ''}
      ${FinalCta(site)}`,
  servicos: (site) => `${Topbar(site)}
      ${Services(site, { titulo: 'h1' })}
      ${Location(site)}`,
  mentoria: (site) => `${Topbar(site)}
      ${Mentoria(site)}`,
};

function renderBody(site, page) {
  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="page page--${page}" data-site="${esc(site.id)}">
    <main id="conteudo" class="main">
      ${PAGINAS[page](site)}
    </main>
    ${Footer(site)}
  </div>
  <div class="toast" role="status" aria-live="polite"></div>`;
}

/** `page`: 'home' (início), 'servicos' ou 'mentoria'. */
export const renderPage = (site, page = 'home') => ({ lang: site.lang, head: renderHead(site, page), body: renderBody(site, page) });
