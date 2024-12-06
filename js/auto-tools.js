id("image-pixelart-to-pixel").addEventListener("input", function () {
    let fr = new FileReader();
    fr.onload = function () {
        let img = new Image();
        img.onload = function () {
            let canvas = document.createElement("canvas")
            canvas.height = img.height
            canvas.width = img.width
            let ctx = canvas.getContext("2d")
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(img, 0, 0)
            let imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let pixelSize = getMinContinuousStreak(imgd)
            let ph = Math.round(img.height / pixelSize)
            let pw = Math.round(img.width / pixelSize)
            //let th = parseInt(id("auto-size-detection-threshold").value)
            if ((pw > (Number(MAX_CANVAS_DIMENSION)) + 20) || ph > (Number(MAX_CANVAS_DIMENSION) + 20)) {
                customAlert(`Dimension Greater Than Supported! (c${pw}:r${ph})`)
                return
            }
            let data = imageToPixelArtData(img, pw, ph)
            addCanvas(ph, pw)
            applyPaintData(data)
            buffer.clearStack()
            recordPaintData()
        };
        img.src = fr.result;
    };

    if (this.files && this.files[0]) {
        fr.readAsDataURL(this.files[0]);

    }
    this.value = null;
})


function getMinContinuousStreak(imageData) {
    const { data, width, height } = imageData;
    let minStreak = Infinity;
    const getColor = (r, g, b, a) => (r << 24) | (g << 16) | (b << 8) | a;
    for (let y = 0; y < height; y++) {
        let currentColor = null;
        let currentStreak = 0;
        let localMinStreak = Infinity
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];
            const color = getColor(r, g, b, a);

            if (color === currentColor) {
                currentStreak++;
            } else {
                if (currentStreak > 0) {
                    localMinStreak = Math.min(localMinStreak, currentStreak);
                }
                currentColor = color;
                currentStreak = 1;
            }
        }
        if (currentStreak > 0) {
            localMinStreak = Math.min(localMinStreak, currentStreak);
        }
        minStreak = Math.min(minStreak, localMinStreak);
    }
    return minStreak === Infinity ? 0 : minStreak;
}