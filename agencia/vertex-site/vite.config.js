import { defineConfig } from 'vite';

/**
 * Pré-renderiza a página a partir do conteúdo (src/content.js) no `vite dev` e no `vite build`:
 * o HTML já chega pronto; o JavaScript do navegador só adiciona os comportamentos.
 */
function prerender() {
  let server;
  return {
    name: 'vertex-prerender',
    configureServer(s) {
      server = s;
    },
    async transformIndexHtml(html) {
      const mod = server ? await server.ssrLoadModule('/src/render.js') : await import(new URL('./src/render.js', import.meta.url).href);
      const page = mod.renderPage();
      return html.replace('<!--app-head-->', page.head).replace('<!--app-body-->', page.body);
    },
    handleHotUpdate({ file, server: s }) {
      if (/[\/]src[\/](content|render)\.js$/.test(file)) {
        s.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({ plugins: [prerender()] });
