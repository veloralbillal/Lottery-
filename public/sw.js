// Service Worker for Native Device Status Bar Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle push event from backend / push service
self.addEventListener('push', (event) => {
  let data = { title: '⚡ New Announcement!', body: 'Check out the latest lottery updates.', url: '/' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'New notification from Lottery Winner',
    icon: data.icon || '/logo.jpg',
    badge: data.badge || '/logo.jpg',
    image: data.imageUrl || data.image || undefined,
    vibrate: [300, 100, 300, 100, 300],
    data: { url: data.url || data.targetTab || '/' },
    actions: [
      { action: 'open', title: '👉 Open App Now' }
    ],
    tag: data.tag || 'lottery-push-' + Date.now(),
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '⚡ Lottery Winner Alert', options)
  );
});

// Handle postMessage from client script to trigger native status bar notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_NATIVE_PUSH') {
    const payload = event.data.payload || {};
    const title = payload.title || '⚡ Lottery Winner System Notification';
    const options = {
      body: payload.message || payload.body || 'Instant update from Lottery Winner',
      icon: payload.icon || '/logo.jpg',
      badge: payload.badge || '/logo.jpg',
      image: payload.imageUrl || undefined,
      vibrate: [300, 100, 300],
      tag: payload.tag || 'status-bar-push-' + Date.now(),
      data: { url: payload.targetTab || payload.url || '/' },
      renotify: true
    };

    self.registration.showNotification(title, options);
  }
});

// Handle notification click from device Status Bar / Notification Center
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if available
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE_TAB', tab: targetUrl });
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
