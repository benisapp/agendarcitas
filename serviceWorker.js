const CACHE_NAME = 'benis-citas-v1';
const FILES_TO_CACHE = [
  '/agendarcitas/',
  '/agendarcitas/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE).catch(() => {
        return Promise.allSettled(
          FILES_TO_CACHE.map((url) => cache.add(url).catch(() => {}))
        );
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/agendarcitas/index.html');
      });
    })
  );
});