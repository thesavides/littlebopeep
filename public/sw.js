// Little Bo Peep — Service Worker
// Strategies:
//   Map tiles        → cache-first (OpenStreetMap)
//   Next.js static   → stale-while-revalidate
//   API / Supabase   → network-only (never cache auth/data)
//   Pages            → network-first with offline fallback

const CACHE_VERSION = 'v2'
const SHELL_CACHE = `lbp-shell-${CACHE_VERSION}`
const TILE_CACHE = `lbp-tiles-${CACHE_VERSION}`
const STATIC_CACHE = `lbp-static-${CACHE_VERSION}`

const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
]

// ─── Install ─────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('lbp-') && ![SHELL_CACHE, TILE_CACHE, STATIC_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch ───────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // Never cache: Supabase API, auth endpoints, internal Next.js data
  if (
    url.hostname.includes('supabase') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/')
  ) {
    event.respondWith(fetch(request))
    return
  }

  // Map tiles — cache-first (tiles don't change; transparent fallback if offline)
  if (url.hostname === 'tile.openstreetmap.org' || url.hostname.endsWith('.tile.openstreetmap.org')) {
    event.respondWith(tileFirst(request))
    return
  }

  // Next.js immutable static assets — stale-while-revalidate
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE))
    return
  }

  // App shell / pages — network-first with offline fallback to '/'
  event.respondWith(networkFirstWithFallback(request))
})

// ─── Strategies ──────────────────────────────────────────────────────────────

async function tileFirst(request) {
  const cache = await caches.open(TILE_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Return a 1x1 transparent PNG so the map doesn't show broken tiles
    return new Response(
      atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
      { headers: { 'Content-Type': 'image/png' } }
    )
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone())
    return response
  }).catch(() => null)

  return cached || fetchPromise
}

async function networkFirstWithFallback(request) {
  const cache = await caches.open(SHELL_CACHE)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    // Last resort: return the app shell root
    const root = await cache.match('/')
    return root || new Response('Offline', { status: 503 })
  }
}

// ─── Background Sync ─────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-reports') {
    event.waitUntil(notifyClientsToSync())
  }
})

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ type: 'window' })
  clients.forEach((client) => client.postMessage({ type: 'SYNC_OFFLINE_REPORTS' }))
}

// ─── Web Push ────────────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = {}
  try { payload = event.data.json() } catch { payload = { title: 'Little Bo Peep', body: event.data.text() } }

  const { title = 'Little Bo Peep', body = '', badge, url = '/', tag } = payload

  // Update the app icon badge
  if ('setAppBadge' in self.registration) {
    if (badge > 0) {
      self.registration.setAppBadge(badge).catch(() => {})
    }
  } else if ('setAppBadge' in navigator) {
    if (badge > 0) navigator.setAppBadge(badge).catch(() => {})
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/app-icon.png',
      badge: '/icon.svg',
      tag: tag || 'lbp-notification',
      renotify: true,
      data: { url },
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope)) {
          client.focus()
          client.postMessage({ type: 'PUSH_NAVIGATE', url })
          return
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(url)
    })
  )
})

// ─── Messages ────────────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  // App tells SW to clear the badge (all notifications read)
  if (event.data?.type === 'CLEAR_BADGE') {
    if ('clearAppBadge' in self.registration) {
      self.registration.clearAppBadge().catch(() => {})
    } else if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(() => {})
    }
  }
  // App tells SW the current unread count (so badge stays correct after app opens)
  if (event.data?.type === 'SET_BADGE' && typeof event.data.count === 'number') {
    if (event.data.count > 0) {
      if ('setAppBadge' in self.registration) {
        self.registration.setAppBadge(event.data.count).catch(() => {})
      }
    } else {
      if ('clearAppBadge' in self.registration) {
        self.registration.clearAppBadge().catch(() => {})
      }
    }
  }
})
