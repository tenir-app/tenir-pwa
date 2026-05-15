const CACHE_NAME = "tenir-v2026-05-13-02";

const ASSETS = [
  "./",
  "./tenir.html",
  "./halten.html",
  "./manifest-fr.webmanifest",
  "./manifest-de.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

// Install : mise en cache de tous les assets essentiels
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate : suppression des anciens caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch : cache d'abord, réseau en fallback
// Fallback navigation iOS : requêtes navigate → halten.html depuis le cache
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || caches.match("./halten.html"))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
