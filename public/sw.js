// Go Safe — minimal service worker (cache-first for assets, network-first for HTML)
const CACHE = 'gosafe-v1';
const ASSETS = ['/', '/icon-192.png', '/icon-512.png', '/favicon.png', '/manifest.webmanifest'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/') || new Response('<h1>Sin conexión</h1>', { headers: { 'Content-Type': 'text/html' } })));
    return;
  }
  e.respondWith(caches.match(req).then(c => c || fetch(req).then(r => {
    const copy = r.clone();
    if (r.ok) caches.open(CACHE).then(cc => cc.put(req, copy));
    return r;
  }).catch(() => c)));
});
