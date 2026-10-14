// De zéro au campus : manuel d'anglais hors connexion.
// La page et le contenu (contenu.json) passent par le réseau d'abord, pour que les mises à jour arrivent dès qu'il y a du réseau ;
// tout le reste (polices, icônes) vient du téléphone. Tout est enregistré dès la première ouverture.
const CACHE = "zac-v1";
const SHELL = ["./", "index.html", "contenu.json", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png",
  "fonts/bricolage-grotesque-normal-latin-ext.woff2","fonts/bricolage-grotesque-normal-latin.woff2","fonts/charis-sil-normal-latin-ext.woff2","fonts/charis-sil-normal-latin.woff2","fonts/literata-italic-latin-ext.woff2","fonts/literata-italic-latin.woff2","fonts/literata-normal-latin-ext.woff2","fonts/literata-normal-latin.woff2"];

self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const path = u.pathname.split("/").pop();
  const networkFirst = e.request.mode === "navigate" || path === "" || path === "index.html" || path === "contenu.json";
  if (networkFirst) {
    const key = e.request.mode === "navigate" || path === "" ? "index.html" : "contenu.json";
    e.respondWith(fetch(u.href, {cache: "no-cache"}).then(r => {
      if (r.ok) { const k = r.clone(); caches.open(CACHE).then(c => c.put(key, k)); }
      return r;
    }).catch(() => caches.match(key)));
  } else {
    e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok) { const k = r.clone(); caches.open(CACHE).then(c => c.put(e.request, k)); }
      return r;
    })));
  }
});
