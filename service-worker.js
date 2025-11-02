const CACHE_NAME = 'shopngo-cache-v1';
const urlsToCache = [
  'login.html',
  'login.js',
  'app.html',
  'app.js',
  'favicon.ico',
  'manifest.json'
];

// Installation du SW et cache initial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache))
  );
});

// Activation du SW
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => response || fetch(event.request))
  );
});
