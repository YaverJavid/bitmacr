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
              "js/utils.js",
                "js/selec.js",
                "js/alert.js",
                "js/lib.local-storage-tools.js",
                "js/lib.slider-plus-minus.js",
                "js/declarations.js",
                "js/stack.js",
                "js/shapes/comman.js",
                "js/shapes/touch.js",
                "js/shapes/mouse.js",
                "js/main.js",
                "js/settings.js",
                "js/color-settings.js",
                "js/filters.js",
                "js/raw-data-handler.js",
                "js/browser-variation-support.js",
                "js/themes.js",
                "js/shortcuts.js",
                "js/animation.js",
                "js/animation-exporter.js",
                "js/fill.js",
                "js/sessions.js",
                "js/trace-image.js",
                "js/export.js",
                "js/canvas-manipulation.js",
                "js/palettes.js",
                "js/sound.js",
                "js/auto-tools.js",
                "js/replace.js",
                "js/ad-management.js",
                "js/app.js",
                "js/color-formula.js",
                "../icons/delete.svg",
                "../icons/download.svg",
                "../icons/play.svg",
                "",
                "lib.local-storage-tools.js"

                ])
        })
    )
})

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request)
        })
    )
})

