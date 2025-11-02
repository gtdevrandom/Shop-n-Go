const CACHE_NAME = 'shopngo-cache-v1';
const urlsToCache = [
  'login.html',
  'login.js',
  'app.html',
  'app.js',
  'favicon.ico',
  'manifest.json'
];

// Installation
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

// Activation
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

// Interception fetch
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // NE PAS intercepter Firebase / Google APIs
  if (
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('firebase') ||
    url.origin.includes('googleapis.com') ||
    url.pathname.includes('/__/auth/')
  ) {
    // Laisse passer la requête directement
    return;
  }

  // Cache first pour fichiers statiques
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
