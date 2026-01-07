const CACHE_NAME = 'star-hexes-v0.0.4';
const urlsToCache = [
  '.',
  'index.html',
  'manifest.json',
  'config.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});