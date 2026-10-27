import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

/** Página pelo caminho do HTML: /servicos/ e /mentoria/ têm o próprio index.html. */
const pageOf = (file = '') => {
  const f = file.split('\\').join('/');
  if (f.includes('/servicos/')) return 'servicos';
  if (f.includes('/mentoria/')) return 'mentoria';
  return 'home';
};

/**
 * Pré-renderiza cada página a partir da config do site ativo (src/sites/index.js),
 * tanto no `vite dev` quanto no `vite build`. O HTML final já contém todo o
 * conteúdo; o JavaScript do navegador apenas adiciona os comportamentos.
 */
function bioSitePrerender() {
  let server;
  return {
    name: 'biosite-prerender',
    configureServer(s) {
      server = s;
    },
    async transformIndexHtml(html, ctx) {
      const mod = server
        ? await server.ssrLoadModule('/src/render.js')
        : await import(new URL('./src/render.js', import.meta.url).href);
      const page = mod.renderPage(mod.site, pageOf(ctx.filename));
      return html
        .replace('<!--app-lang-->', page.lang)
        .replace('<!--app-head-->', page.head)
        .replace('<!--app-body-->', page.body);
    },
    handleHotUpdate({ file, server: s }) {
      // Conteúdo e componentes são renderizados no servidor: recarrega a página inteira.
      if (/[\\/]src[\\/](sites|components|lib|render)/.test(file) && file.endsWith('.js')) {
        s.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  plugins: [bioSitePrerender()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        servicos: fileURLToPath(new URL('./servicos/index.html', import.meta.url)),
        mentoria: fileURLToPath(new URL('./mentoria/index.html', import.meta.url)),
      },
    },
  },
});
