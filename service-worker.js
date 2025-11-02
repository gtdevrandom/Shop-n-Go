const CACHE_NAME = 'shopngo-cache-v1';
const urlsToCache = [
  'login.html',
  'login.js',
  'app.html',
  'app.js',
  'favicon.ico',
  'manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // NE PAS intercepter Firebase ou Google APIs
  if (url.origin.includes('firestore.googleapis.com') || url.origin.includes('firebase')) {
    // Laisse la requête passer normalement
    return event.respondWith(fetch(event.request));
  }

  // Cache first pour fichiers statiques
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});


  // Cache first pour fichiers statiques
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
