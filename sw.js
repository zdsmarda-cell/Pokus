const CACHE_NAME = 'totem-zvire-v4'; // Změnil jsem verzi na v4
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://img.icons8.com/fluency/192/wolf.png',
  'https://img.icons8.com/fluency/512/wolf.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        const cachePromises = urlsToCache.map(url => {
            return fetch(url, { mode: 'no-cors' }).then(response => {
                return cache.put(url, response);
            }).catch(err => {
                console.warn('Failed to cache:', url, err);
            });
        });
        return Promise.all(cachePromises);
      })
  );
  // Odstraněno self.skipWaiting() - chceme, aby uživatel potvrdil aktualizaci
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Posloucháme zprávu z aplikace pro aktivaci nové verze
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});