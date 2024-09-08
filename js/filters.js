const simplifyColorsThreshold = id("simplify-colors-threshold")


function filterCanvas(filterFunction, ...args) {
    let currentPaintData = buffer.getItem()
    for (let i = 0; i < currentPaintData.length; i++) {
        let colorObj = convertRGBAStrToObj(currentPaintData[i])
        if (colorObj.a === undefined) colorObj.a = 1
        setCellColor(paintCells[i], colorObjectToRGBA(filterFunction(colorObj, i, ...args)))

    }
    recordPaintData()
}


id("filter-invert").onclick = () => {
    filterCanvas((pixel, pid) => {
        let rflag = id("invert-b-channel").checked
        let gflag = id("invert-g-channel").checked
        let bflag = id("invert-b-channel").checked
        let aflag = id("invert-a-channel").checked
        let r = rflag ? (255 - pixel.r) : pixel.r
        let g = gflag ? (255 - pixel.g) : pixel.g
        let b = bflag ? (255 - pixel.b) : pixel.b
        let a = aflag ? (1 - pixel.a) : pixel.a
        return { r, g, b, a };
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

id("filter-remove-ghost-colors").onclick = () => filterCanvas((pixel, pid) => pixel.a == 0 ? { r: 0, g: 0, b: 0, a: 0 } : pixel)


id("shift-colors-button").onclick = () => {
    filterCanvas((pixel, pid) => {
        if (pixel.a == 0) return pixel
        return {
            r: Math.min(255, pixel.r + (Math.round(Math.random() * 25))),
            g: Math.min(255, pixel.g + (Math.round(Math.random() * 25))),
            b: Math.min(255, pixel.b + (Math.round(Math.random() * 25))),
            a: pixel.a
        };
    })
}

id("filter-bnw").onclick = () => {
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
    let aExpr = id("custom-filter-a").value
    rExpr = rExpr === "" ? "r" : rExpr
    gExpr = gExpr === "" ? "g" : gExpr
    bExpr = bExpr === "" ? "b" : bExpr
    aExpr = aExpr === "" ? "a" : aExpr

    filterCanvas((p, pid) => {
        with (p) {
            return {
                r: eval(rExpr),
                g: eval(gExpr),
                b: eval(bExpr),
                a: eval(aExpr)
            }
        }
    })
}

function gaussianBlur(pixels, width, height, blurRadius) {
    const blurredPixels = new Array(pixels.length);
    const alphaProcess = id('gaussian-blur-alpha-process').value;

    // Loop through every pixel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let redSum = 0;
            let greenSum = 0;
            let blueSum = 0;
            let weightSum = 0;
            let alphaSum = 0; // Used only if alpha processing mode is 'mix'

            // Loop through neighboring pixels within kernel radius
            for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                    const neighborX = x + dx;
                    const neighborY = y + dy;

                    // Handle edge cases (clamp to image boundaries)
                    const clampedX = Math.max(0, Math.min(neighborX, width - 1));
                    const clampedY = Math.max(0, Math.min(neighborY, height - 1));

                    // Calculate distance from center pixel
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Apply Gaussian weight based on distance
                    const weight = Math.exp(-distance * distance / (2 * blurRadius * blurRadius));

                    const index = clampedY * width + clampedX;
                    const rgbaString = pixels[index];
                    const rgbaValues = convertRGBAStrToObj(rgbaString);

                    // Accumulate color values and weight
                    redSum += rgbaValues.r * weight;
                    greenSum += rgbaValues.g * weight;
                    blueSum += rgbaValues.b * weight;
                    weightSum += weight;
                    alphaSum += rgbaValues.a * weight;
                }
            }
            // Calculate the average color values
            const averagedRed = Math.round(redSum / weightSum);
            const averagedGreen = Math.round(greenSum / weightSum);
            const averagedBlue = Math.round(blueSum / weightSum);
            // Determine the alpha value
            let alpha;
            if (alphaProcess == 'preserve-alpha') {
                alpha = convertRGBAStrToObj(pixels[pack(x, y)]).a
            } else if (alphaProcess == 'loose-alpha') {
                alpha = 1;
            } else if (alphaProcess == 'mix') {
                alpha = alphaSum / weightSum;
            }

            // Construct the blurred pixel and store it
            let blurredPixel = `rgba(${averagedRed}, ${averagedGreen}, ${averagedBlue}, ${alpha})`;
            if (alpha == 0) blurredPixel = "rgba(0, 0, 0, 0)"
            blurredPixels[y * width + x] = blurredPixel;
        }
    }

    return blurredPixels;
}


function boxBlur(pixels, width, height, blurRadius) {
    const blurredPixels = new Array(pixels.length);
    const kernelSize = blurRadius * 2 + 1;
    const kernelArea = kernelSize * kernelSize;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let redSum = 0;
            let greenSum = 0;
            let blueSum = 0;

            for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                    const neighborX = x + dx;
                    const neighborY = y + dy;

                    const clampedX = Math.max(0, Math.min(neighborX, width - 1));
                    const clampedY = Math.max(0, Math.min(neighborY, height - 1));

                    const index = clampedY * width + clampedX;
                    const rgbaString = pixels[index];
                    const rgbaValues = convertRGBAStrToObj(rgbaString);

                    redSum += parseInt(rgbaValues.r);
                    greenSum += parseInt(rgbaValues.g);
                    blueSum += parseInt(rgbaValues.b);
                }
            }

            const averagedRed = Math.round(redSum / kernelArea);
            const averagedGreen = Math.round(greenSum / kernelArea);
            const averagedBlue = Math.round(blueSum / kernelArea);
            const blurredPixel = `rgb(${averagedRed}, ${averagedGreen}, ${averagedBlue})`;
            blurredPixels[y * width + x] = blurredPixel;
        }
    }

    return blurredPixels;
}

function sharpen(pixels, width, height) {
    const sharpenedPixels = new Array(pixels.length);
    const kernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ];
    const kernelSize = 3;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let redSum = 0;
            let greenSum = 0;
            let blueSum = 0;

            for (let dy = 0; dy < kernelSize; dy++) {
                for (let dx = 0; dx < kernelSize; dx++) {
                    const neighborX = x + dx - 1;
                    const neighborY = y + dy - 1;

                    const clampedX = Math.max(0, Math.min(neighborX, width - 1));
                    const clampedY = Math.max(0, Math.min(neighborY, height - 1));

                    const index = clampedY * width + clampedX;
                    const rgbaString = pixels[index];
                    const rgbaValues = convertRGBAStrToObj(rgbaString);

                    const kernelValue = kernel[dy][dx];
                    redSum += kernelValue * parseInt(rgbaValues.r);
                    greenSum += kernelValue * parseInt(rgbaValues.g);
                    blueSum += kernelValue * parseInt(rgbaValues.b);
                }
            }

            const clampedRed = Math.max(0, Math.min(255, redSum));
            const clampedGreen = Math.max(0, Math.min(255, greenSum));
            const clampedBlue = Math.max(0, Math.min(255, blueSum));
            const sharpenedPixel = `rgb(${clampedRed}, ${clampedGreen}, ${clampedBlue})`;
            sharpenedPixels[y * width + x] = sharpenedPixel;
        }
    }

    return sharpenedPixels;
}

function motionBlur(pixels, width, height, blurRadius, direction = 'horizontal') {
    const blurredPixels = new Array(pixels.length);
    const kernelSize = blurRadius * 2 + 1; // Total kernel elements
    const kernelArea = kernelSize;  // Assuming a uniform kernel for simplicity

    const weights = calculateMotionBlurWeights(blurRadius, kernelSize, direction);  // New line

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let redSum = 0;
            let greenSum = 0;
            let blueSum = 0;

            for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                // Calculate offset based on direction (considering edge clamping)
                let offsetY = Math.max(0, Math.min(y + dy * (direction === 'vertical' ? 1 : 0), height - 1));

                for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                    // Calculate offset based on direction (considering edge clamping)
                    let offsetX = Math.max(0, Math.min(x + dx * (direction === 'horizontal' ? 1 : 0), width - 1));

                    const index = offsetY * width + offsetX;
                    const rgbaString = pixels[index];
                    const rgbaValues = convertRGBAStrToObj(rgbaString);

                    const weight = weights[dy + blurRadius][dx + blurRadius];  // Access weight using offsets

                    redSum += parseInt(rgbaValues.r) * weight;
                    greenSum += parseInt(rgbaValues.g) * weight;
                    blueSum += parseInt(rgbaValues.b) * weight;
                }
            }

            const averagedRed = Math.round(redSum / kernelArea);  // Use kernelArea for simplicity
            const averagedGreen = Math.round(greenSum / kernelArea);
            const averagedBlue = Math.round(blueSum / kernelArea);
            const blurredPixel = `rgb(${averagedRed}, ${averagedGreen}, ${averagedBlue})`;
            blurredPixels[y * width + x] = blurredPixel;
        }
    }

    return blurredPixels;
}



function createCircularKernel(radius) {
    const size = radius * 2 + 1;
    const kernel = Array.from({ length: size }, () => Array(size).fill(0));
    const center = radius;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
            if (distance <= radius) {
                kernel[y][x] = 1;
            }
        }
    }

    return kernel;
}


// Helper function to calculate motion blur weights (optional)
function calculateMotionBlurWeights(blurRadius, kernelSize, direction) {
    const weights = new Array(kernelSize);
    for (let i = 0; i < kernelSize; i++) {
        weights[i] = new Array(kernelSize);
        for (let j = 0; j < kernelSize; j++) {
            const distance = Math.abs(i - blurRadius) + Math.abs(j - blurRadius);
            weights[i][j] = direction === 'horizontal' ? 1 / (distance + 1) : 1;  // Adjust for direction (uniform for vertical)
        }
    }
    return weights;
}

id("filter-box-blur").onclick = () => {
    let blurredData = boxBlur(buffer.getItem().slice(), cols, rows, id("box-blur-radius").value)
    applyPaintData(blurredData)
    recordPaintData()
}
id("filter-gaussian-blur").onclick = () => {
    let blurredData = gaussianBlur(buffer.getItem().slice(), cols, rows, id("gaussian-blur-radius").value)
    applyPaintData(blurredData)
    recordPaintData()
}
id("filter-motion-blur").onclick = () => {
    let blurredData = motionBlur(buffer.getItem().slice(), cols, rows, parseInt(id("motion-blur-radius").value), id("motion-blur-direction").value)
    applyPaintData(blurredData)
    recordPaintData()
}
id("filter-sharpen").onclick = () => {
    let filteredData = sharpen(buffer.getItem().slice(), cols, rows)
    applyPaintData(filteredData)
    recordPaintData()
}

id("motion-blur-radius").oninput = () => {
    id("motion-blur-radius-shower").innerHTML = `(${id("motion-blur-radius").value})`
}
id("gaussian-blur-radius").oninput = () => {
    id("gaussian-blur-radius-shower").innerHTML = `(${id("gaussian-blur-radius").value})`
}
id("box-blur-radius").oninput = () => {
    id("box-blur-radius-shower").innerHTML = `(${id("box-blur-radius").value})`
}

