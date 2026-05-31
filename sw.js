const CACHE = 'yumechizu-v57';
const ASSETS = [
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

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.url.includes('workers.dev')){
    e.respondWith(fetch(e.request).catch(() => 
      new Response(JSON.stringify({error:'offline'}),{headers:{'Content-Type':'application/json'}})
    ));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    }).catch(() => caches.match('/index.html'))
  );
});

// オンライン復帰時にクライアントに通知
self.addEventListener('message', e => {
  if(e.data === 'SYNC') {
    self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage('ONLINE_SYNC'));
    });
  }
});
