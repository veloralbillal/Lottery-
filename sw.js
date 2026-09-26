/**
 * LOTTERY WINNER - UNIFIED SERVICE WORKER
 * Implements:
 * 1. Domain-aware caching strategy
 * 2. Native Push Notification handlers
 * 3. Cache versioning
 */

const CACHE_VERSION = 'v1.0.2';
const DOMAIN = self.location.hostname;
const CACHE_NAME = `lw-cache-${DOMAIN}-${CACHE_VERSION}`;

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW] Clearing old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  
  // Only cache static assets, excluding API calls and Firebase
  const isStaticAsset = 
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2|woff|ttf|json)$/) &&
    !url.pathname.includes('/api/') &&
    !url.hostname.includes('firestore.googleapis.com');

  const isCDNLibraries = 
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com');

  if (e.request.method === 'GET' && (isStaticAsset || isCDNLibraries)) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        const fetchPromise = fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse || new Response('Offline', { status: 503 }));

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// PUSH NOTIFICATION ENGINE
self.addEventListener('push', (event) => {
  let data = { title: '⚡ Lottery Winner Alert', body: 'New update available!', url: '/' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'New notification from Lottery Winner',
    icon: './logo.jpg',
    badge: './logo.jpg',
    image: data.imageUrl || data.image || undefined,
    vibrate: [300, 100, 300],
    data: { url: data.url || data.targetTab || '/' },
    tag: data.tag || 'lottery-push-' + Date.now(),
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '⚡ Lottery Winner Alert', options)
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_NATIVE_PUSH') {
    const payload = event.data.payload || {};
    const options = {
      body: payload.message || payload.body || 'Instant update from Lottery Winner',
      icon: './logo.jpg',
      badge: './logo.jpg',
      image: payload.imageUrl || undefined,
      vibrate: [300, 100, 300],
      tag: payload.tag || 'status-bar-push-' + Date.now(),
      data: { url: payload.targetTab || payload.url || '/' },
      renotify: true
    };
    self.registration.showNotification(payload.title || '⚡ Lottery Winner Notification', options);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE_TAB', tab: targetUrl });
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});
