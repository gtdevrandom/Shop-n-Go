const CACHE_NAME = 'shopngo-cache-v1';
const urlsToCache = [
  'login.html',
  'login.js',
  'app.html',
  'app.js',
  'favicon.ico',
  'manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // NE PAS intercepter Firebase
  if (url.origin.includes('firestore.googleapis.com') || url.origin.includes('firebase')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
