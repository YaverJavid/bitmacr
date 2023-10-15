const simplifyColorsThreshold = document.getElementById("simplify-colors-threshold")


function filterCanvas(filterFunction, ...args) {
    let currentPaintData = buffer.getItem()
    for (let i = 0; i < currentPaintData.length; i++) {
        let colorObj = convertRGBAStrToObj(currentPaintData[i])
        if (colorObj.a === undefined) colorObj.a = 1
        setCellColor(paintCells[i], colorObjectToRGBA(filterFunction(colorObj, ...args)))

    }
    recordPaintData()
}


document.getElementById("filter-invert").addEventListener("click", () => {
    filterCanvas((pixel) => {
        return {
            r: 255 - pixel.r,
            g: 255 - pixel.g,
            b: 255 - pixel.b,
            a: pixel.a
        };
    })
})

document.getElementById("filter-sepia").addEventListener("click", () => {
    filterCanvas((pixel) => {
        let r = pixel.r;
        let g = pixel.g;
        let b = pixel.b;
        pixel.r = (r * 0.393) + (g * 0.769) + (b * 0.189);
        pixel.g = (r * 0.349) + (g * 0.686) + (b * 0.168);
        pixel.b = (r * 0.272) + (g * 0.534) + (b * 0.131);
        return pixel;
    })
})


document.getElementById("filter-grayscale").addEventListener("click", () => {
    filterCanvas((pixel) => {
        const average = (pixel.r + pixel.g + pixel.b) / 3;
        return { r: average, g: average, b: average, a: pixel.a };
    })
})
document.getElementById("filter-solorize").addEventListener("click", () => {
    filterCanvas((pixel) => {
        return {
            r: pixel.r > 128 ? 255 - pixel.r : pixel.r,
            g: pixel.g > 128 ? 255 - pixel.g : pixel.g,
            b: pixel.b > 128 ? 255 - pixel.b : pixel.b,
            a: pixel.a
        };
    })
})

document.getElementById("shift-colors-button").addEventListener("click", () => {
    filterCanvas((pixel) => {
        if (pixel.a == 0) return pixel
        return {
            r: Math.min(255, pixel.r + (Math.round(Math.random() * 50) - 25)),
            g: Math.min(255, pixel.g + (Math.round(Math.random() * 50) - 25)),
            b: Math.min(255, pixel.b + (Math.round(Math.random() * 50) - 25)),
            a: pixel.a
        };
    })
})

document.getElementById("filter-duotone").addEventListener("click", () => {
    filterCanvas((pixel) => {
        let r = pixel.r
        let g = pixel.g
        let b = pixel.b
        let a = pixel.a
        let average = (r + g + b) / 3
        if (average > 127.5)
            return { a, r: 255, g: 255, b: 255 }
        return { a, r: 0, g: 0, b: 0 }
    })
})


function simplifyColors(colors, th = 150){
    let uniqueColors = [colors[0]]
    for (let i = 0; i < colors.length; i++) {
        for(let j = 0; j < uniqueColors.length; j++){
            if(matchHexColors(colors[i], uniqueColors[j], th)){
                colors[i] = uniqueColors[j]
                break
            }
            if(j == uniqueColors.length-1) uniqueColors.push(colors[i])
        }
            
    }
    return colors
}

function simplifyColorsEvent(){
    let hexColors = []
    let paintData = buffer.getItem()
    for (let i = 0; i < paintData.length; i++) {
        hexColors.push(rgbaToHex(paintData[i]))
    }
    applyPaintData(simplifyColors(hexColors, simplifyColorsThreshold.value), true)
    recordPaintData()
}

simplifyColorsThreshold.oninput = ()=>{
    document.getElementById("simplify-colors-threshold-shower").textContent = `(${simplifyColorsThreshold.value})`
}

