const CACHE_NAME = "tenir-v2026-05-16-02";

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

// Fetch :
// - Navigations HTML → Network-First (détecte les nouvelles versions)
//   + fallback cache si hors ligne
// - Autres assets → Cache-First (images, icônes)
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Mettre à jour le cache avec la réponse réseau
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          // Offline : servir depuis le cache
          caches.match(event.request)
            .then(cached => cached || caches.match("./tenir.html"))
        )
    );
    return;
  }

  // Assets statiques : Cache-First
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
