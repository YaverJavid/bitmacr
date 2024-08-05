self.addEventListener('install', e => {
    self.skipWaiting();  // Activate service worker immediately
});

self.addEventListener('activate', e => {
    clients.claim();  // Take control of all pages within scope immediately
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.open('dynamic-cache').then(cache => {
            return cache.match(e.request).then(res => {
                return res || fetch(e.request).then(fetchRes => {
                    // Cache new requests dynamically
                    cache.put(e.request, fetchRes.clone());
                    return fetchRes;
                });
            });
        })
    );
});
