// Little Bo Peep — Service Worker
// Handles offline caching, background sync, and map tile persistence

const CACHE_VERSION = 'v1'
const SHELL_CACHE = `lbp-shell-${CACHE_VERSION}`
const TILE_CACHE = `lbp-tiles-${CACHE_VERSION}`
const ALL_CACHES = [SHELL_CACHE, TILE_CACHE]

// Pages to pre-cache on install
const APP_SHELL_URLS = ['/']

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  )
})

// ─── Activate ─────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !ALL_CACHES.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ─── Fetch ────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never intercept non-GET or cross-origin API calls
  if (request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return

  // Map tiles — cache-first (so cached tiles show while offline)
  if (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('basemaps.cartocdn.com') ||
    url.pathname.match(/\/tiles\//)
  ) {
    event.respondWith(tileFirst(request))
    return
  }

  // Next.js static assets — cache-first, very long-lived
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, SHELL_CACHE))
    return
  }

  // Static files (icons, manifest, fonts)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?|ttf|webp|json)$/)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE))
    return
  }

  // Page navigations — network first, fall back to cached version of /
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }
})

// ─── Strategies ───────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function tileFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(TILE_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Return a transparent 1px PNG so the map grid doesn't break layout
    const empty =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    return new Response(atob(empty), {
      headers: { 'Content-Type': 'image/png' },
    })
  }
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    // Final fallback — serve the root page from cache
    return caches.match('/') || new Response('Offline', { status: 503 })
  }
}

// ─── Background Sync ──────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-reports') {
    event.waitUntil(notifyClientsToSync())
  }
})

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true })
  clients.forEach((client) =>
    client.postMessage({ type: 'SYNC_OFFLINE_REPORTS' })
  )
}

// ─── Message handler ──────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
