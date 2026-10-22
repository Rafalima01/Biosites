import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

/**
 * Pré-renderiza cada página a partir da config do site (src/sites/index.js),
 * tanto no `vite dev` quanto no `vite build`. O HTML final já contém todo o
 * conteúdo; o JavaScript do navegador apenas adiciona os comportamentos.
 *
 * Páginas: index.html → 'home' · portfolio/index.html → 'portfolio'.
 */
const pageOf = (path) => (/[\\/]portfolio[\\/]/.test(path) ? 'portfolio' : 'home');

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
      const page = mod.renderPage(mod.site, pageOf(ctx.filename || ctx.path));
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
        portfolio: fileURLToPath(new URL('./portfolio/index.html', import.meta.url)),
      },
    },
  },
});
