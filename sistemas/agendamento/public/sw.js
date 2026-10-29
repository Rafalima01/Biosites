// Service worker do painel: recebe os avisos (push) e abre a página certa ao tocar.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = { title: 'Agenda', body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(dados.title || 'Agenda', {
      body: dados.body || '',
      icon: '/icone-192.png',
      badge: '/badge-96.png',
      tag: dados.tag || undefined,
      renotify: Boolean(dados.tag),
      data: { url: dados.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((abertas) => {
      for (const c of abertas) {
        if (c.url.startsWith(self.location.origin) && 'focus' in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
