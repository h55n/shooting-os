const CACHE_NAME = 'shooter-v2';
const SHELL = [
  '/',
  '/plan',
  '/ideas',
  '/content',
  '/assistant',
  '/masterclass',
  '/offline-shoot',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const shootingMatch = url.pathname.match(/^\/content\/([^/]+)\/shoot\/?$/);
        if (shootingMatch) {
          const fallback = await caches.match('/offline-shoot');
          if (fallback) {
            const redirectUrl = new URL('/offline-shoot', self.location.origin);
            redirectUrl.searchParams.set('id', shootingMatch[1]);
            return Response.redirect(redirectUrl.toString(), 302);
          }
        }
        return (await caches.match(url.pathname)) || (await caches.match('/')) || new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
