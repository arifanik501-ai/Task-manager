// HisabNikash service worker — network-first for the app shell so
// every fresh deploy is picked up immediately, with cache fall-back
// for offline use.
const CACHE_NAME = "hisabnikash-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./firebase-sync.js",
  "./manifest.json",
  "./icon.svg",
  "./app-logo.png",
  "./app-logo-192.png",
  "./app-logo-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  // Allow `SKIP_WAITING` from the page to flush the previous SW immediately.
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

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Heuristic: any request for HTML/CSS/JS on our own origin is part of
// the app shell and must be network-first so updated deploys override
// the previously-cached copy. Everything else (images, fonts, manifest,
// icon) stays cache-first for speed.
function isAppShellRequest(request, url) {
  if (request.mode === "navigate") return true;
  const dest = request.destination;
  if (dest === "document" || dest === "script" || dest === "style") return true;
  return /\.(?:html|js|mjs|css)$/i.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // Never intercept Firebase / Google APIs / gstatic — RTDB needs live
  // sockets and the SDK loads must always come from the network.
  if (
    url.hostname.endsWith("firebaseio.com") ||
    url.hostname.endsWith("googleapis.com") ||
    url.hostname.endsWith("gstatic.com") ||
    url.hostname.endsWith("firebase.com")
  ) {
    return;
  }

  // Only manage our own origin; let cross-origin requests fall through.
  if (url.origin !== self.location.origin) return;

  if (isAppShellRequest(event.request, url)) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});

async function networkFirst(request) {
  try {
    const fresh = await fetch(request, { cache: "no-store" });
    if (fresh && fresh.ok) {
      const copy = fresh.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
    }
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const fallback = await caches.match("./index.html");
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      const copy = fresh.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
    }
    return fresh;
  } catch {
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}
