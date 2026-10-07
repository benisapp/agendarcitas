const CACHE_NAME = 'benis-citas-v6'
const FONT_CACHE = 'benis-fonts-v1'
// El scope absoluto incluye el base (p.ej. https://host/agendarcitas/).
const SCOPE = self.registration.scope
const APP_SHELL = new URL('index.html', SCOPE).href

async function cacheUrl(cache, url) {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (response && response.status === 200) {
      await cache.put(url, response)
    }
  } catch {
    /* pulsa fallos individuales sin abortar el precache */
  }
}

async function precacheApp(cache) {
  await Promise.all([cacheUrl(cache, SCOPE), cacheUrl(cache, APP_SHELL)])

  // Los bundles de Vite llevan hash en el nombre, así que se descubren
  // leyendo el index.html para precachearlos y que la app funcione offline
  // desde la primera recarga.
  let html = ''
  try {
    const response = await fetch(APP_SHELL, { cache: 'no-store' })
    if (response.ok) html = await response.text()
  } catch {
    return
  }

  const urls = new Set()
  const re = /(?:src|href)="([^"]+)"/g
  let match
  while ((match = re.exec(html)) !== null) {
    try {
      const url = new URL(match[1], APP_SHELL)
      if (url.origin === self.location.origin && url.href.startsWith(SCOPE)) {
        urls.add(url.href)
      }
    } catch {
      /* ignora URLs inválidas */
    }
  }

  await Promise.all([...urls].map((url) => cacheUrl(cache, url)))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => precacheApp(cache))
      .catch(() => undefined),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== FONT_CACHE)
          .map((name) => caches.delete(name)),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const requestUrl = new URL(request.url)

  // Tipografías de Google Fonts: cache-first con revalidación en segundo
  // plano para conservar la tipografía sin conexión.
  if (
    requestUrl.origin === 'https://fonts.googleapis.com' ||
    requestUrl.origin === 'https://fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          })
          .catch(() => null)
        return cached || (await network) || Response.error()
      }),
    )
    return
  }

  if (requestUrl.origin !== self.location.origin) return
  if (!requestUrl.href.startsWith(SCOPE)) return

  const isNavigation = request.mode === 'navigate'

  // Red primero (sin caché HTTP) para no quedarse con el HTML viejo; en caso de
  // fallo se usa la copia en caché (offline).
  event.respondWith(
    fetch(request, { cache: 'no-store' })
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached
          return isNavigation ? caches.match(APP_SHELL) : Response.error()
        }),
      ),
  )
})