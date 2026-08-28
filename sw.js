/* MELEC Tracker - service worker
   Strategie : cache-first sur les fichiers de l'application (statiques),
   avec repli sur index.html pour toute navigation hors connexion.
   Bumper CACHE_VERSION a chaque modification d'index.html pour forcer la MAJ. */

var CACHE_VERSION = 'melec-v2';
var ASSETS = [
    './',
    './index.html',
    './manifest.webmanifest',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable-512.png',
    './apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function (cache) { return cache.addAll(ASSETS); })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) {
                return k === CACHE_VERSION ? null : caches.delete(k);
            }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (event) {
    var req = event.request;
    if (req.method !== 'GET') { return; }
    if (new URL(req.url).origin !== self.location.origin) { return; }

    event.respondWith(
        caches.match(req).then(function (cached) {
            if (cached) { return cached; }
            return fetch(req).then(function (res) {
                if (res && res.status === 200 && res.type === 'basic') {
                    var copy = res.clone();
                    caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
                }
                return res;
            }).catch(function () {
                // hors connexion et non mis en cache : on sert l'application
                if (req.mode === 'navigate') { return caches.match('./index.html'); }
                return new Response('', { status: 504, statusText: 'Hors connexion' });
            });
        })
    );
});
