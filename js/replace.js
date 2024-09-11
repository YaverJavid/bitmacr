replaceButton.onclick = ()=> {
    for (let i = 0; i < paintCells.length; i++) {
        let currentColor = rgbToHex(getComputedStyle(paintCells[i]).getPropertyValue("background-color"))
        if (matchHexColors(targetColor, currentColor, colorMatchThresholdSlider.value))
            setCellColor(paintCells[i], replaceWithNormalCheckbox.checked ? getCurrentSelectedColor() : replacementColor)
    }
    recordPaintData()
}

id("replace-content-awarely").onclick = () => {
    let pd = toPaintData2D(buffer.getItem().slice())
    let tc = hexToRgbaObject(targetColor)
    applyPaintData(replaceContentAwarely(pd, tc))
    recordPaintData()
}

function replaceContentAwarely(colorArray, targetColor) {
    let th = colorMatchThresholdSlider.value
    for (let y = 0; y < colorArray.length; y++) {
        for (let x = 0; x < colorArray[y].length; x++) {
            const currentColor = convertRGBAStrToObj(colorArray[y][x])
            if (!areRGBAObjsEqual(currentColor, targetColor, th)) continue
            let neighborColor = null
            if (x + 1 < colorArray[y].length) neighborColor = convertRGBAStrToObj(colorArray[y][x + 1])
            if (x > 0 && (!neighborColor || areRGBAObjsEqual(neighborColor, targetColor, th)))
                neighborColor = convertRGBAStrToObj(colorArray[y][x - 1]);
            if (!neighborColor) neighborColor = { r: 0, g: 0, b: 0, a: 1 }
            colorArray[y][x] = `rgba(${neighborColor.r}, ${neighborColor.g}, ${neighborColor.b}, ${neighborColor.a})`
        }
    }
    return colorArray.flat();
}