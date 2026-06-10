const CACHE_VERSION = 87;
const CACHE_NAME = `yumechizu-v${CACHE_VERSION}`;
const STATIC_CACHE = `yumechizu-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `yumechizu-dynamic-v${CACHE_VERSION}`;
const API_CACHE = `yumechizu-api-v${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/bg.jpg',
  '/home_AI.png',
  '/palette.png',
  '/momishibo.png'
];

const API_ENDPOINTS = [
  'workers.dev',
  'cloudflare.com'
];

// ─── Install Event ───
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate Event ───
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(k => k.startsWith('yumechizu-') && !k.includes(`v${CACHE_VERSION}`))
        .map(k => {
          console.log(`[SW] Deleting old cache: ${k}`);
          return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch Event - Smart Caching Strategy ───
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // 1. API Requests: Network First → Cache
  if (API_ENDPOINTS.some(api => url.hostname.includes(api))) {
    e.respondWith(
      fetch(request)
        .then(res => {
          console.log('[SW] API response received:', res);
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          const clone = res.clone();
          caches.open(API_CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(err => {
          console.warn('[SW] API offline, using cache:', request.url, err);
          return caches.match(request)
            .then(cached => {
              if (cached) {
                console.log('[SW] Returning cached response:', cached);
                return cached;
              }
              return new Response(
                JSON.stringify({ error: 'offline', url: request.url }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
              );
            });
        })
    );
    return;
  }

  // 2. Static Assets: Cache First → Network
  if (request.method === 'GET' && 
      (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff|woff2)$/i) || 
       request.destination === 'style' || request.destination === 'script')) {
    e.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          return fetch(request)
            .then(res => {
              if (!res || res.status !== 200) return res;
              const clone = res.clone();
              caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
              return res;
            });
        })
        .catch(() => {
          if (request.destination === 'image') {
            return new Response('', { status: 404 });
          }
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 3. HTML Pages: Network First → Cache → Fallback
  if (request.method === 'GET' && (request.destination === 'document' || url.pathname === '/')) {
    e.respondWith(
      fetch(request)
        .then(res => {
          if (!res || res.status !== 200) return res;
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => cached || caches.match('/index.html'));
        })
    );
    return;
  }

  // 4. Default: Network First with Cache Fallback
  e.respondWith(
    fetch(request)
      .then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
        return res;
      })
      .catch(() => caches.match(request))
  );
});

// ─── Message Event - Sync & Push Notifications ───
self.addEventListener('message', e => {
  const { data } = e;

  // Online Sync
  if (data === 'SYNC' || data?.type === 'SYNC') {
    self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage({ type: 'ONLINE_SYNC' }));
    });
  }

  // Clear Caches
  if (data?.type === 'CLEAR_CACHE') {
    caches.keys().then(names => {
      Promise.all(names.map(name => caches.delete(name)));
    });
  }

  // Cache Full Page
  if (data?.type === 'CACHE_PAGE' && data?.url) {
    caches.open(DYNAMIC_CACHE).then(cache => {
      fetch(data.url).then(res => cache.put(data.url, res));
    });
  }
});

// ─── Push Notification (Optional) ───
self.addEventListener('push', e => {
  if (!e.data) return;
  const payload = e.data.json().catch(() => ({ title: 'Notification' }));
  const options = {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    ...payload
  };
  e.waitUntil(self.registration.showNotification(payload.title || 'Yumechizu', options));
});

// ─── Notification Click ───
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
