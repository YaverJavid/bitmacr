id("clear-all-lighting-objects").onclick = () => {
    for (let i = 0; i < paintCells.length; i++) {
        const cell = paintCells[i]
        cell.style.backgroundImage = "none"
        cell.lightingObjectType = undefined
    }
}

function createBrightnessMap(x, y) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            paintCells[pack(i, j)].lightingFactor = paintCells[pack(i, j)].lightingFactor || 0
            if (isShadowed(paintCells, x, y, i, j)) continue
            const distance = Math.sqrt((i - x) ** 2 + (j - y) ** 2);
            const intensity = (1 / (distance)) * 3;
            paintCells[pack(i, j)].lightingFactor += Math.min(intensity, 1)
        }
    }
}



function applyBrightnessMap() {
    for (let i = 0; i < paintCells.length; i++) {
        const cell = paintCells[i]
        let color = increaseBrightness(buffer.getItem()[i], Math.min(cell.lightingFactor, 1))
        cell.lightingFactor = 0
        if (color) setCellColor(cell, color)
    }
    recordPaintData()
}

id("apply-light").onclick = () => {
    for (let i = 0; i < paintCells.length; i++) {
        const cell = paintCells[i]
        if (cell.lightingObjectType == '@bulb') {
            let y = Math.floor(i / cols)
            let x = i % cols
            createBrightnessMap(x, y)
        }
    }
    applyBrightnessMap()
}

function increaseBrightness(rgba, influence) {
    if (!influence) return
    const rgbaValues = convertRGBAStrToObj(rgba)
    let { r, g, b, a } = rgbaValues;

    // Ensure influence is between 0 and 1
    influence = Math.max(0, Math.min(1, influence));

    // Calculate new RGB values based on influence
    r = Math.min(255, r + (255 - r) * influence);
    g = Math.min(255, g + (255 - g) * influence);
    b = Math.min(255, b + (255 - b) * influence);

    // Return the new RGBA color string
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}


function isShadowed(array, lx, ly, xc, yc) {
    const dx = Math.abs(xc - lx);
    const dy = Math.abs(yc - ly);
    const sx = lx < xc ? 1 : -1;
    const sy = ly < yc ? 1 : -1;
    let err = dx - dy;
    while (lx !== xc || ly !== yc) {
        if (array[pack(lx, ly)].lightingObjectType === "@barrier") return true;
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            lx += sx;
            if (array[pack(lx, ly)].lightingObjectType === "@barrier") return true; // Check horizontal move
        }
        if (e2 < dx) {
            err += dx;
            ly += sy;
            if (array[pack(lx, ly)].lightingObjectType === "@barrier") return true; // Check vertical move
        }
    }
    return array[pack(lx, ly)].lightingObjectType === "@barrier";
}

let lightingObjectsHidden = false

id("hide-lighting-objects").onclick = () => {
    if (lightingObjectsHidden) {
        id("hide-lighting-objects").value = 'Hide  Objects'
        lightingObjectsHidden = false
        for (let i = 0; i < paintCells.length; i++) {
            const cell = paintCells[i]
            let iconPath
            if (cell.lightingObjectType == "@bulb") iconPath = "url(icons/lighting/bulb.png)"
            else if (cell.lightingObjectType == '@barrier') iconPath = "url(icons/lighting/barrier.png)"
            else continue
            cell.style.backgroundImage = iconPath
        }
    } else {
        id("hide-lighting-objects").value = 'Show Objects'
        lightingObjectsHidden = true
        for (let i = 0; i < paintCells.length; i++) {
            const cell = paintCells[i]
            cell.style.backgroundImage = "none"
        }
    }
}