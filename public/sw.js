// A simple, no-op service worker that satisfies the PWA installability requirements
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // We can add caching logic here later if needed
  // For now, it just bypasses to the network
  event.respondWith(fetch(event.request));
});
