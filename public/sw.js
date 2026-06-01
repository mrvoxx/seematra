// A simple, no-op service worker that satisfies the PWA installability requirements
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // We leave this empty to satisfy the PWA install requirement,
  // but we do NOT call event.respondWith() so that the browser 
  // handles all requests natively. This prevents CORS and opaque 
  // response issues with cross-origin images (Cloudinary) and maps.
});
