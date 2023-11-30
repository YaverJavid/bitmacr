function toPixelArtDimentions(ctx, canvas) {
    let imgd = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let d = imgd.data
    let verticalTransitionsCountArray = []
    for (let hl = 0; hl < canvas.height; hl++) {
        verticalTransitionsCountArray.unshift(0)
        let lc = undefined
        for (let i = 0; i < canvas.width * 4; i += 4) {
            let index = i + (hl * canvas.width * 4)
            let r = d[index]
            let g = d[index + 1]
            let b = d[index + 2]
            let a = d[index + 3]
            let c = new RGB(r, g, b)
            if (lc)
                if (!c.isEqual(lc)) verticalTransitionsCountArray[0] ++
            lc = new RGB(r, g, b)
        }
    }
    let width = Math.max(...verticalTransitionsCountArray)
    let pixelSize = canvas.width / width
    let height = Math.round((canvas.height) / pixelSize)
    return { height, width }
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


id("image-pixelart-to-pixel").addEventListener("input", function(event){
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
            let dimensions = toPixelArtDimentions(ctx, canvas)
            let data = imageToPixeArtData(img, dimensions.width, dimensions.height)
            addCanvas(dimensions.width, dimensions.height)
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
