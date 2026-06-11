const CACHE = "pdf-signer-v1";
const ASSETS = [
    "./Agreement%20pdf-signer%20(Mobile).HTML",
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

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
