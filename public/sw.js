// ── AuditWise Service Worker ──────────────────────────────────
const CACHE_NAME = 'auditwise-v1'

// Fichiers à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// ── Installation ───────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ AuditWise PWA : Cache installé')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// ── Activation ────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch : Network First → Cache Fallback ────────────────────
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes API
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre en cache la réponse fraîche
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone)
        })
        return response
      })
      .catch(() => {
        // Si pas de réseau → utiliser le cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached
          // Fallback vers index.html pour les routes React
          return caches.match('/index.html')
        })
      })
  )
})