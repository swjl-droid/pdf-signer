const CACHE = "pdf-signer-v4";
const ASSETS = [
    "./",
    "./index.html",
    "./Agreement%20pdf-signer%20(Mobile).html",
    "./Agreement%20pdf-signer%20(Desktop).html",
    "./lib/pdf.min.js",
    "./lib/pdf.worker.min.js",
    "./lib/pdf-lib.min.js",
    "./lib/signature_pad.umd.min.js",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./manifest.json"
];

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Network-first for pages, cache-first for everything else.
//
// The old handler was cache-first for *everything*, which meant a page already
// in the cache was served forever and edits pushed to GitHub never appeared
// until the cache name changed. Pages now always try the network first and fall
// back to the cache only when offline, so the app stays up to date on its own.
// The libraries under lib/ never change without a filename change, so they stay
// cache-first and keep the app fast and fully usable offline.
self.addEventListener("fetch", e => {
    if (e.request.method !== "GET") return;

    const isPage = e.request.mode === "navigate" ||
                   e.request.destination === "document";

    if (isPage) {
        e.respondWith(
            fetch(e.request)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
                    return res;
                })
                .catch(() => caches.match(e.request).then(c => c || caches.match("./index.html")))
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(cached => cached || fetch(e.request))
        );
    }
});