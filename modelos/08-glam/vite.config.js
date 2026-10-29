import { defineConfig } from 'vite';

/**
 * Pré-renderiza a página a partir da config do site ativo (src/sites/index.js),
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
    async transformIndexHtml(html) {
      const mod = server
        ? await server.ssrLoadModule('/src/render.js')
        : await import(new URL('./src/render.js', import.meta.url).href);
      const page = mod.renderPage(mod.site);
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
});
