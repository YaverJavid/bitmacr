function toPixelArtDimensions(ctx, canvas) {
    let imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let d = imgd.data;
    let minVerticalColorChunkSize = Infinity;
    let currentVerticalColorChunkSize = 0;
    let lastColor = undefined;

    for (let hl = 0; hl < canvas.height; hl++) {
        for (let i = 0; i < canvas.width * 4; i += 4) {
            let index = i + (hl * canvas.width * 4);
            let r = d[index];
            let g = d[index + 1];
            let b = d[index + 2];
            let a = d[index + 3];
            let c = new RGB(r, g, b);

            if (lastColor) {
                if (c.isEqual(lastColor)) {
                    currentVerticalColorChunkSize++;
                } else {
                    if (minVerticalColorChunkSize > currentVerticalColorChunkSize) {
                        minVerticalColorChunkSize = currentVerticalColorChunkSize;
                    }
                    currentVerticalColorChunkSize = 1;
                }
            } else {
                currentVerticalColorChunkSize++;
            }

            lastColor = c;
        }
    }

    if (minVerticalColorChunkSize > currentVerticalColorChunkSize) {
        minVerticalColorChunkSize = currentVerticalColorChunkSize;
    }

    let height = Math.floor(canvas.height / minVerticalColorChunkSize);
    let width = Math.floor(canvas.width / minVerticalColorChunkSize);

    return { height, width };
}

class RGB {
    constructor(r, g, b) {
        this.r = r;
        this.b = b;
        this.g = g;
    }
    isEqual(rgb) {
        return this.r == rgb.r && this.g == rgb.g && this.b == rgb.b
    }
}


id("image-pixelart-to-pixel").addEventListener("input", function(event) {
    let fr = new FileReader();
    fr.onload = function() {
        let img = new Image();
        img.onload = function() {
            let canvas = document.createElement("canvas")
            canvas.height = img.height
            canvas.width = img.width
            let ctx = canvas.getContext("2d")
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(img, 0, 0)
            let dimensions = toPixelArtDimensions(ctx, canvas)
            if (dimensions.width > 200 || dimensions.height > 200) {
                customAlert(`Dimension Greater Than 100! (${dimensions.height}:${dimensions.width})`)
                return
            }
            let data = imageToPixeArtData(img, dimensions.width, dimensions.height)
            addCanvas(dimensions.height, dimensions.width)
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