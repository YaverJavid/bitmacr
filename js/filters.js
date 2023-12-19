const simplifyColorsThreshold = id("simplify-colors-threshold")


function filterCanvas(filterFunction, ...args) {
    let currentPaintData = buffer.getItem()
    for (let i = 0; i < currentPaintData.length; i++) {
        let colorObj = convertRGBAStrToObj(currentPaintData[i])
        if (colorObj.a === undefined) colorObj.a = 1
        setCellColor(paintCells[i], colorObjectToRGBA(filterFunction(colorObj,i, ...args)))

    }
    recordPaintData()
}


id("filter-invert").onclick = () => {
    filterCanvas((pixel, pid) => {
        return {
            r: 255 - pixel.r,
            g: 255 - pixel.g,
            b: 255 - pixel.b,
            a: pixel.a
        };
    })
}

id("filter-sepia").onclick = () => {
    filterCanvas((pixel, pid) => {
        let r = pixel.r;
        let g = pixel.g;
        let b = pixel.b;
        pixel.r = (r * 0.393) + (g * 0.769) + (b * 0.189);
        pixel.g = (r * 0.349) + (g * 0.686) + (b * 0.168);
        pixel.b = (r * 0.272) + (g * 0.534) + (b * 0.131);
        return pixel;
    })
}

id("filter-grayscale").onclick = () => {
    filterCanvas((pixel, pid) => {
        const average = (pixel.r + pixel.g + pixel.b) / 3;
        return { r: average, g: average, b: average, a: pixel.a };
    })
}

id("filter-solorize").onclick = () => {
    filterCanvas((pixel, pid) => {
        return {
            r: pixel.r > 128 ? 255 - pixel.r : pixel.r,
            g: pixel.g > 128 ? 255 - pixel.g : pixel.g,
            b: pixel.b > 128 ? 255 - pixel.b : pixel.b,
            a: pixel.a
        };
    })
}

id("shift-colors-button").onclick = () => {
    filterCanvas((pixel, pid) => {
        if (pixel.a == 0) return pixel
        return {
            r: Math.min(255, pixel.r + (Math.round(Math.random() * 50) - 25)),
            g: Math.min(255, pixel.g + (Math.round(Math.random() * 50) - 25)),
            b: Math.min(255, pixel.b + (Math.round(Math.random() * 50) - 25)),
            a: pixel.a
        };
    })
}

id("filter-duotone").onclick = () => {
    filterCanvas((pixel, pid) => {
        let r = pixel.r
        let g = pixel.g
        let b = pixel.b
        let a = pixel.a
        let average = (r + g + b) / 3
        if (average > 127.5)
            return { a, r: 255, g: 255, b: 255 }
        return { a, r: 0, g: 0, b: 0 }
    })
}

function simplifyColors(colors, th = 150) {
    let uniqueColors = [colors[0]]
    for (let i = 0; i < colors.length; i++) {
        for (let j = 0; j < uniqueColors.length; j++) {
            if (matchHexColors(colors[i], uniqueColors[j], th)) {
                colors[i] = uniqueColors[j]
                break
            }
            if (j == uniqueColors.length - 1) uniqueColors.push(colors[i])
        }

    }
    return colors
}

function simplifyColorsEvent() {
    let hexColors = []
    let paintData = buffer.getItem()
    for (let i = 0; i < paintData.length; i++) {
        hexColors.push(rgbaToHex(paintData[i]))
    }
    applyPaintData(simplifyColors(hexColors, simplifyColorsThreshold.value), true)
    recordPaintData()
}

simplifyColorsThreshold.oninput = () => id("simplify-colors-threshold-shower").textContent = `(${simplifyColorsThreshold.value})`



id("apply-custom-filter").onclick = () => {
    let rExpr = id("custom-filter-r").value
    let gExpr = id("custom-filter-g").value
    let bExpr = id("custom-filter-b").value
    rExpr = rExpr === "" ? "r" : rExpr
    gExpr = gExpr === "" ? "g" : gExpr
    bExpr = bExpr === "" ? "b" : bExpr

    filterCanvas((p, pid) => {
        with(p) {
            return {
                r: eval(rExpr),
                g: eval(gExpr),
                b: eval(bExpr),
                a
            }
        }
    })
}


