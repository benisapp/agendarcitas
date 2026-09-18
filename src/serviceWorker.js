const CACHE_NAME = 'benis-citas-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/agendarcitas/', '/agendarcitas/index.html']);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      const requestUrl = new URL(event.request.url);
      if (requestUrl.pathname.startsWith('/agendarcitas/')) {
        return fetch(event.request).then((fetchResp) => {
          return fetchResp;
        });
      }
      return fetch(event.request);
    })
  );
});