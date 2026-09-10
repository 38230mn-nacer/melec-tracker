/* Défi Dérivées 1.0.0 — cache hors ligne */
const CACHE_VERSION = 'derivees-defi-1.0.0';
const ASSETS = ["./derivees-defi.html", "./derivees-defi.webmanifest", "./derivees-defi-icon-192.png", "./derivees-defi-icon-512.png", "./derivees-defi-icon-maskable-512.png", "./derivees-defi-apple-touch-icon.png"];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE_VERSION ? null : (k.startsWith('derivees-defi-') ? caches.delete(k) : null)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const cp = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(r, cp));
      }
      return res;
    }).catch(() => caches.match(r).then(c => c || (r.mode === 'navigate' ? caches.match('./derivees-defi.html') : new Response('', { status: 504 }))))
  );
});
