/* ================================
   Yumechizu Service Worker (SAFE)
   - AI / API は絶対にキャッシュしない
   - 静的アセットのみキャッシュ
================================ */

const CACHE_VERSION = 100;
const STATIC_CACHE = `yumechizu-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `yumechizu-dynamic-v${CACHE_VERSION}`;

// 静的アセットのみ
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/bg.jpg',
  '/home_AI.png',
  '/palette.png',
  '/momishibo.png',
  '/PDF.png'
];

/* ---------- Install ---------- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ---------- Activate ---------- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('yumechizu-') && !k.includes(`v${CACHE_VERSION}`))
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------- Fetch ---------- */
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  /* 🚫 最重要：API は完全スルー（AI事故防止） */
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  /* ---------- HTML ---------- */
  if (request.mode === 'navigate') {
    // legal/terms/privacy/support等の独立ページはそのまま取得
    const isSubPage = url.pathname !== '/' && url.pathname !== '/index.html' && url.pathname.endsWith('.html');
    if (isSubPage) {
      event.respondWith(fetch(request).catch(() => caches.match(request)));
      return;
    }
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put('/index.html', clone));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  /* ---------- Static Assets ---------- */
  if (
    request.method === 'GET' &&
    (
      url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff|woff2)$/i) ||
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image'
    )
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (!res || res.status !== 200) return res;
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  /* ---------- Default ---------- */
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

/* ---------- Message ---------- */
self.addEventListener('message', event => {
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => {
      keys.forEach(k => caches.delete(k));
    });
  }
});
