// Monta o HTML de cada página a partir da config do site. Executado pelo Vite
// (plugin em vite.config.js) no dev e no build, então a página chega pronta ao navegador.
import { esc, attrs } from './lib/html.js';
import { Hero, Menu, Phrase, About, Help, Cta, Gallery, Faq } from './components/Home.js';
import { Topbar, Services } from './components/Servicos.js';
import { Booking } from './components/Agendar.js';
import { Footer } from './components/Footer.js';

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
    // `:root:root` vence o :root do tokens.css, que o Vite carrega depois deste bloco.
    tokens ? `<style>:root:root{${esc(tokens)}}</style>` : '',
    `<script>document.documentElement.classList.add('js')</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');
}

// Conteúdo de cada página. No desktop o início vira duas colunas: o "celular" (topo e cards)
// fixo à esquerda e as seções à direita; no celular é uma coluna só.
const PAGINAS = {
  home: (site) => `<div class="intro">
      ${Hero(site)}
      <div class="intro__body">
        ${Menu(site)}
        ${Phrase(site)}
      </div>
    </div>
    <div class="content">
      ${About(site)}
      ${Help(site)}
      ${Cta(site)}
      ${Gallery(site)}
      ${Faq(site)}
    </div>`,
  servicos: (site) => `${Topbar(site)}
    ${Services(site)}
    ${Cta(site)}`,
  agendar: (site) => `${Topbar(site)}
    ${Booking(site)}`,
};

function renderBody(site, page) {
  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <main class="layout layout--${page}" id="conteudo" data-site="${esc(site.id)}">
    ${PAGINAS[page](site)}
  </main>
  ${Footer(site)}
  <div class="toast" role="status" aria-live="polite"></div>`;
}

/** `page`: 'home' (início), 'servicos' ou 'agendar'. */
export const renderPage = (site, page = 'home') => ({ lang: site.lang, head: renderHead(site, page), body: renderBody(site, page) });
