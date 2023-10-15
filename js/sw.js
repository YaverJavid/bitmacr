self.addEventListener('install', e => {
    e.waitUntil(
        caches.open('static').then(cache => {
            return cache.addAll([
                "../",
                "../favicon.png",
                "../logo.png",
                "../mascot.png",
                "../favicon.ico",
                "main.js",
                "../style.css",
                "../manifest.json",
                "../index.html",
                "sw.js",
                "stack.js",
                "utils.js",
                "declarations.js",
                "settings-pre.js",
                "stack.js",
                "shapes.js",
                "main.js",
                "settings.js",
                "filters.js",
                "raw-data-handler.js",
                "browser-variation-support.js",
                "themes.js",
                "shortcuts.js",
                "../icons/delete.svg",
                "../icons/download.svg",
                "../icons/play.svg",
                "",
                "lib.local-storage-tools.js"

                ])
        })
    )
})

self.addEventListener("fetch",e =>{
    e.respondWith(
        caches.match(e.request).then(res =>{
            return res || fetch(e.request)
        })
        )
})
