id("clear-all-lighting-objects").onclick = () => {
    for (let i = 0; i < paintCells.length; i++) {
        const cell = paintCells[i]
        cell.style.backgroundImage = "none"
        cell.lightingObjectType = undefined
    }
}

function createBrightnessMap(x, y) {
    let lightLaw = id('light-law').value
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            paintCells[pack(i, j)].lightingFactor = paintCells[pack(i, j)].lightingFactor || 0
            if (isShadowed(paintCells, x, y, i, j)) continue
            const distance = Math.sqrt((i - x) ** 2 + (j - y) ** 2);
            const intensity = (lightLaw == 'inverse' ? (1 / (distance)) : (1 / (distance ** 2))) * id("light-intensity").value
            paintCells[pack(i, j)].lightingFactor += Math.min(intensity, 1)
        }
    }
}



function applyBrightnessMap() {
    let {r, g, b} = hexToRgbObject(id("light-color").value)
    let lightColor = `rgba(${r}, ${g}, ${b}, ${id("light-color-opacity").value})`
    for (let i = 0; i < paintCells.length; i++) {
        const cell = paintCells[i]
        let color = mixlight(lightColor, buffer.getItem()[i], Math.min(cell.lightingFactor, 1))
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
    if(id("auto-ghost-color-elimination-post-lighting").checked)
        filterCanvas((pixel, pid) => pixel.a == 0 ? { r: 0, g: 0, b: 0, a: 0 } : pixel)
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

function mixlight(lightColor, color, intensity) {
    lightColor = convertRGBAStrToObj(lightColor)
    color = convertRGBAStrToObj(color)
    // Blend each color component
    const r = Math.round(lightColor.r * intensity + color.r * (1 - intensity));
    const g = Math.round(lightColor.g * intensity + color.g * (1 - intensity));
    const b = Math.round(lightColor.b * intensity + color.b * (1 - intensity));
    const a = lightColor.a * intensity + color.a * (1 - intensity);
    
    return `rgba(${r}, ${g}, ${b}, ${a})`
}

id("light-color-opacity").oninput = ()=>{
    id('light-color-opacity-shower').textContent = `(${id("light-color-opacity").value})`
}