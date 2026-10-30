// Torna o painel instalável ("Adicionar à Tela de Início"): abre como app, sem barra do navegador.
export default function manifest() {
  return {
    name: 'Agenda · Painel do studio',
    short_name: 'Agenda',
    description: 'Agenda do studio: horários, agendamentos e avisos.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f4f5f7',
    theme_color: '#1f4266',
    lang: 'pt-BR',
    icons: [
      { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
