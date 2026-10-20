// Frostpass: hält das Spiel offline verfügbar.
// Zeigt sofort die gespeicherte Version und lädt im Hintergrund die neueste nach.
const CACHE = 'frostpass-v2';
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "fonts/grenze-latin-600-normal.woff2",
  "fonts/grenze-latin-700-normal.woff2",
  "fonts/barlow-latin-400-normal.woff2",
  "fonts/barlow-latin-500-normal.woff2",
  "fonts/barlow-latin-600-normal.woff2",
  "fonts/barlow-condensed-latin-500-normal.woff2",
  "fonts/barlow-condensed-latin-600-normal.woff2",
  "fonts/barlow-condensed-latin-700-normal.woff2"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req)
      .then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
      .catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    if (res) return res;
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  }));
});
