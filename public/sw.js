// Bump CACHE_VERSION whenever caching behavior changes so activate() purges old caches.
const CACHE_VERSION = "v2";
const CACHE_NAME = `project99-${CACHE_VERSION}`;
const OFFLINE_FALLBACK = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_FALLBACK, "/manifest.webmanifest", "/icon.svg"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function cacheSuccessfulResponse(request, response) {
  if (response && response.ok) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }

  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Pages: network-first so new deploys are picked up; cached copy only as an offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => cacheSuccessfulResponse(request, response))
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match(OFFLINE_FALLBACK))
        )
    );
    return;
  }

  // Hashed build assets are immutable, so cache-first is safe for them.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((response) => cacheSuccessfulResponse(request, response))
      )
    );
    return;
  }

  // Everything else (manifest, icons, other public assets): network-first with cache fallback.
  event.respondWith(
    fetch(request)
      .then((response) => cacheSuccessfulResponse(request, response))
      .catch(() => caches.match(request))
  );
});
