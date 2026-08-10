const CACHE = "our-home-v14-admin-analytics";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./our-home-icons/icon-180.png",
  "./our-home-icons/icon-192.png",
  "./our-home-icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isDocument = event.request.mode === "navigate" ||
    event.request.destination === "document" ||
    url.pathname.endsWith("/index.html");

  if (isDocument) {
    event.respondWith(
      fetch(event.request, {cache:"no-store"}).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put("./index.html", copy)).catch(() => {});
        return response;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});