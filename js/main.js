const colSlider = document.getElementById("col-slider")
const rowSlider = document.getElementById("row-slider")
const rowsShower = document.getElementById("rows-shower")
const colsShower = document.getElementById("cols-shower")
const decrementRow = document.getElementById("decrement-row")
const incrementRow = document.getElementById("increment-row")
const decrementCol = document.getElementById("decrement-col")
const incrementCol = document.getElementById("increment-col")

let getAccentColor = () => getComputedStyle(root).getPropertyValue("--accent")
let getSecondaryColor = () => getComputedStyle(root).getPropertyValue("--secondary")
let getPrimaryColor = () => getComputedStyle(root).getPropertyValue("--primary")
let setAccentColor = color => root.style.setProperty("--accent", color)
let setSecondaryColor = color => root.style.setProperty("--secondary", color)
let setPrimaryColor = color => root.style.setProperty("--primary", color)

let targetColor = colorToBeReplacedSelector.value
let replacementColor = colorToReplaceWithSelector.value
colorToBeReplacedSelector.addEventListener("change", () => {
    targetColor = colorToBeReplacedSelector.value
})



colorToReplaceWithSelector.addEventListener("change", () => {
    replacementColor = colorToReplaceWithSelector.value
})

const VERSION = "v.2024.018"
id("version").textContent = VERSION


let cellWidth
let cellHeight
let prevSelectedColor
let buffer = new Stack(1024)
let borderColor = getPrimaryColor().slice(1)
let cellBorderWidth = 1
// hex should be lowercase
var defaultPalletteColors = []
let usedColors = defaultPalletteColors.flat()
let tabLocations = []
let pallateColors = document.getElementsByClassName("pallate-color")
let currentSelectedColor = undefined
const B_COLOR = "pix_color"
const rotateClockwise = document.getElementById("rotate-clockwise-button")
setPaletteCurrentColor(localStorageREF[B_COLOR] || "#334470")
let chooseColorRandomly = false
let rows = 10,
    cols = 10
let menuSegmentLocations = []

for (let i = 0; i < menus.length; i++) {
    let currentMenuName = menus[i].children[1].textContent
    menuSegmentLocations.push(i * controlWidth)
    let shortcutKey = menus[i].children[1].dataset.shortcutkey
    menuNav.innerHTML += `<div class="menu-nav-items" data-shortcutkey="${shortcutKey}" >${currentMenuName.toUpperCase()}
      <kbd class="shortcut-info" style="display: ${shortcutKey ? "initial" : "none"}" >
                 ${shortcutKey ? 'ctrl+' + shortcutKey : "NONE"} 
      </kbd>
    </div>`
}

function redirectMenuViewTo(location) {
    bottomControls.scrollLeft = location
}
let currentTabIndex = 0
function gotoTab(tabName, scrollIntoView = false) {
    if (scrollIntoView) bottomControls.scrollIntoView()
    redirectMenuViewTo(tabLocations[tabName] * controlWidth)
    currentTabIndex = tabLocations[tabName]
}

for (let i = 0; i < menuNav.children.length; i++) {
    menuNav.children[i].addEventListener("click", () => {
        redirectMenuViewTo(i * controlWidth)
        currentTabIndex = i
    })
    if (bottomControls.children[i].children[1].dataset.type == "hidden-tab") {
        menuNav.children[i].style.display = "none"
    }
    if (bottomControls.children[i].children[1].dataset.tabname) {
        tabLocations[bottomControls.children[i].children[1].dataset.tabname] = i
    }
}


function firstLevelArrayCompare(arr1, arr2) {
    if (arr1.length != arr2.length) return false
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) return false
    }
    return true
}


let fillMissCount = 0

function recordPaintData() {
    let data = []
    for (let i = 0; i < cells.length; i++) {
        data.push(window.getComputedStyle(cells[i]).getPropertyValue('background-color'))
    }
    let canvasData;
    let skipCheck = false
    try {
        canvasData = buffer.getItem()
    } catch {
        skipCheck = true;
    }
    if ((!skipCheck) && firstLevelArrayCompare(data, canvasData)) {
        fillMissCount++
        if (prefFillModeWarning.checked) {
            if (fillMissCount >= 5 && onlyFillIfColorIsCheckbox.checked) {
                fillMissCount = 0
                customConfirm("It seems you've forgotten about the fill rule that you applied, Do you want to remove it?", () => {
                    onlyFillIfColorIsCheckbox.checked = false
                    id("info-fill-rule").textContent = "[FR:OFF],"
                    id("info-fill-rule").style.color = "var(--primary)"
                })
            } else if (!onlyFillIfColorIsCheckbox.checked) {
                fillMissCount = 0
            }
        }
        return data
    }
    buffer.deleteRight()
    buffer.addItem(data)
    fillMissCount = 0
    return data
}

function applyPaintData(data, simpleFill = true) {
    // simpleFill : IF IT IS UNDO OR REDO WE WANT TO DO A SIMPLE FILL
    if (simpleFill) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = data[i]
        }
        return
    }
    for (var i = 0; i < cells.length; i++) {
        setCellColor(cells[i], data[i])
    }
}

let cells2d

function addCanvas(argRows, argCols, clearStack = true) {
    rows = argRows
    cols = argCols
    id("info-size").textContent = `[c${cols}:r${rows}]`
    if (clearStack)
        buffer.clearStack()
    paintZone.innerHTML = ""
    let HTML = ' <div id="selection-shower"></div>'
    let i = 0
    while (i < rows * cols) {
        HTML += `<div class="cell"></div>`
        i++
    }
    let elemWidth = parseFloat(getComputedStyle(paintZone).getPropertyValue("width")) / window.innerWidth * 100 / cols
    paintZone.style.height = elemWidth * rows + "vw"
    paintZone.innerHTML = HTML
    paintZone.style.gridTemplateRows = `repeat(${rows}, 1fr)`
    paintZone.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
    if (typeof sessions !== 'undefined') sessions[currentSession].updateCanvasSize()
    rowsShower.innerHTML = `(${rows})`
    colsShower.innerHTML = `(${cols})`
    colSlider.value = cols
    rowSlider.value = rows
    if (rows != cols) {
        rotateClockwise.style.opacity = "0.3"
        rotateClockwise.disabled = true
    } else {
        rotateClockwise.style.opacity = "1"
        rotateClockwise.disabled = false
    }
    canvasSizeShower.innerHTML = `(c${cols} : r${rows})`
    for (let i = 0; i < cells.length; i++) {
        cells[i].index = i
        cells[i].onclick = function () {
            if (openCheckbox) {
                let fullColor = rgbToHex(buffer.getItem()[i])
                let selectedColor = fullColor.slice(0, 7)
                let _openCheckbox = openCheckbox
                id(openCheckbox).checked = false
                openCheckbox = undefined
                switch (_openCheckbox) {
                    case 'select-color':
                        setPaletteCurrentColor(selectedColor)
                        break
                    case 'select-color-for-find':
                        colorToBeReplacedSelector.value = selectedColor
                        targetColor = selectedColor
                        break
                    case 'select-color-for-replacer':
                        colorToReplaceWithSelector.value = selectedColor
                        replacementColor = selectedColor
                        break
                    case 'copy-color-from-cell-checkbox':
                        copyTextToClipboard(selectedColor);
                        copiedColorShower.innerHTML = `If Color Wasn't Copied, Copy Manually: <span class="color">${selectedColor}</span> <span style="user-select:none; color: ${selectedColor}; background: ${selectedColor}; border: 0.5px solid var(-secondary)" >!!!!</span>`
                        break
                    case 'select-hue-from-cell':
                        hueAngle.value = getHSLFromHex(selectedColor).hue
                        hue = parseFloat(hueAngle.value)
                        updateHueShower()
                        updateHueColorShower()
                        break
                    case 'select-saturation-cell':
                        saturationSlider.value = getHSLFromHex(selectedColor).saturation * 100
                        saturationShower.innerHTML = `(${saturationSlider.value}%)`
                        updateHueColorShower()
                        break
                    case 'select-lighting-cell':
                        lightingSlider.value = getHSLFromHex(selectedColor).lightness * 100
                        updateHueColorShower()
                        lightingShower.innerHTML = `(${lightingSlider.value}%)`
                        break
                    case 'select-for-only-fill-if':
                        if (fillOnlyThisColor.value) fillOnlyThisColor.value += "||"
                        fillOnlyThisColor.value += selectedColor
                        createFillRuleArray()
                        break
                    case 'select-color-for-palette-creator':
                        paletteCreatorPalette.selected.style.background = selectedColor
                        break
                    case 'paste-onclick-checkbox':
                        openCheckbox = _openCheckbox
                        id(_openCheckbox).checked = true
                        let y = Math.floor(i / cols)
                        let x = i % cols
                        if (!selectedPart) return
                        let cells2d = []
                        for (let i = 0; i < cells.length; i++)  cells2d.push(cells[i])
                        cells2d = toPaintData2D(cells2d);
                        paste(
                            x + selectedPart[0].length,
                            y + selectedPart.length,
                            selectedPart,
                            cells2d
                        )
                        recordPaintData()
                        break
                    case 'onclick-fill-col':
                        openCheckbox = _openCheckbox
                        id(_openCheckbox).checked = true
                        fillCol(i % cols, Math.floor(i / cols))
                        break
                    case 'onclick-fill-row':
                        openCheckbox = _openCheckbox
                        id(_openCheckbox).checked = true
                        fillRow(Math.floor(i / cols), i % cols)
                        break
                    case 'select-hits-specific-color':
                        id("hits-specific-color").value = fullColor
                        break
                }
                recordPaintData()
            } else if (clickModeSelector.value == "fill" && colorMSelector.value != 'lighting') {
                applyPaintData(floodFill(toPaintData2D(buffer.getItem()), i % cols, Math.floor(i / cols)).flat())
                recordPaintData()
            } else {
                setCellColor(this, getCurrentSelectedColor())
                recordPaintData()
            }
        }
    }
    recordPaintData()
    cells2d = []
    for (let i = 0; i < cells.length; i++) cells2d.push(cells[i])
    cells2d = toPaintData2D(cells2d);
    refreshGuides()
}

function fillRowCellsInRange(y, start, end, step, centerColor, mainCall) {
    let mode = id("stop-col-row-fill-propogation-if").value
    let stopperColor = mode == 'hits-specific-color' ? id('hits-specific-color').value : 'NONE'
    let flow = id("flow-col-row-filling").checked
    for (let x = start; x != end; x += step) {
        let cell = cells[pack(x, y)];
        let currentColor = rgbaToHex(window.getComputedStyle(cell).getPropertyValue('background-color'));
        if (stopperColor == currentColor) return
        if (mode == "color-changes" && currentColor != centerColor) return
        if (flow && mainCall) fillCol(x, y, false)
        else setCellColor(cell, getCurrentSelectedColor());
    }
}

function fillColCellsInRange(x, start, end, step, centerColor, mainCall) {
    let mode = id("stop-col-row-fill-propogation-if").value
    let stopperColor = mode == 'hits-specific-color' ? id('hits-specific-color').value : 'NONE'
    let flow = id("flow-col-row-filling").checked
    for (let y = start; y != end; y += step) {
        let cell = cells[pack(x, y)];
        let currentColor = rgbaToHex(window.getComputedStyle(cell).getPropertyValue('background-color'));
        if (stopperColor == currentColor) return
        if (mode == "color-changes" && currentColor != centerColor) return
        if (flow && mainCall) fillRow(y, x, false)
        else setCellColor(cell, getCurrentSelectedColor());
    }
}

function fillRow(y, pivot, mainCall = true) {
    let centerColor = rgbaToHex(window.getComputedStyle(cells[pack(pivot, y)]).getPropertyValue('background-color'));
    fillRowCellsInRange(y, pivot, cols, 1, centerColor, mainCall);
    fillRowCellsInRange(y, pivot - 1, -1, -1, centerColor, mainCall);
}


function fillCol(x, pivot, mainCall = true) {
    let centerColor = rgbaToHex(window.getComputedStyle(cells[pack(x, pivot)]).getPropertyValue('background-color'));
    fillColCellsInRange(x, pivot, rows, 1, centerColor, mainCall)
    fillColCellsInRange(x, pivot - 1, -1, -1, centerColor, mainCall)
}

colorSelector.addEventListener("input", function () {
    setPaletteCurrentColor(this.value)
    colorHistorySequenceIndex = 0
})


function setPaletteCurrentColor(color) {
    currentSelectedColor = color
    colorSelector.value = color
    if (!usedColors.includes(color.toLowerCase())) {
        pallateContainer.innerHTML += getPaletteHTML(color)
        usedColors.push(color)
    }
    removePalletteSelectionHint()
    localStorageREF.setItem(B_COLOR, color)
}


undo.addEventListener("click", () => {
    if (buffer.setPointer(buffer.pointer - 1))
        applyPaintData(buffer.getItem())
})

redo.addEventListener("click", () => {
    if (buffer.setPointer(buffer.pointer + 1))
        applyPaintData(buffer.getItem())
})


// Color Copier Manager
let openCheckbox
for (let colorCopierCheckbox in clickManagerCheckboxes) {
    clickManagerCheckboxes[colorCopierCheckbox].oninput = function () {
        if (!this.checked) {
            openCheckbox = undefined
            return
        }
        if (openCheckbox) id(openCheckbox).checked = false
        openCheckbox = this.id
    }
}


cellBorderWidthSlider.oninput = () => cellBorderWidthShower.innerHTML = `(${cellBorderWidthSlider.value})`

function packQuadrants(quadrant1, quadrant2, quadrant3, quadrant4) {
    var packedArray = [];
    for (var i = 0; i < quadrant1.length; i++) {
        packedArray.push(quadrant1[i].concat(quadrant2[i]));
    }
    for (var i = 0; i < quadrant3.length; i++) {
        packedArray.push(quadrant3[i].concat(quadrant4[i]));
    }
    return packedArray.flat();
}



multiplyQButton.addEventListener("click", () => {
    let qToCopy = multiplyQSelector.value
    let data = toPaintData2D(recordPaintData())
    let qToCopyData = getQuadrant(data, qToCopy)
    let newQ1, newQ2, newQ3, newQ4
    if (qToCopy == 1) {
        newQ1 = qToCopyData
    } else if (qToCopy == 2) {
        newQ1 = flip2DArrayHorizontally(qToCopyData)
    } else if (qToCopy == 3) {
        newQ1 = flip2DArrayVertically(qToCopyData)
    } else if (qToCopy == 4) {
        newQ1 = flip2DArrayHorizontally((flip2DArrayVertically(qToCopyData)))
    }
    if (multiplyTargetCheckboxes.q2MultiplyTargetCheckbox.checked) {
        newQ2 = flip2DArrayHorizontally(newQ1)
    } else {
        newQ2 = getQuadrant(data, 2)
    }
    if (multiplyTargetCheckboxes.q3MultiplyTargetCheckbox.checked) {
        newQ3 = flip2DArrayVertically(newQ1)
    } else {
        newQ3 = getQuadrant(data, 3)
    }

    if (multiplyTargetCheckboxes.q4MultiplyTargetCheckbox.checked) {
        newQ4 = flip2DArrayHorizontally(flip2DArrayVertically(newQ1))
    } else {
        newQ4 = getQuadrant(data, 4)
    }
    if (!multiplyTargetCheckboxes.q1MultiplyTargetCheckbox.checked) {
        newQ1 = getQuadrant(data, 1)
    }

    applyPaintData(packQuadrants(newQ1, newQ2, newQ3, newQ4))
    recordPaintData()
})

selectAllCopyTargets.addEventListener("click", () => {
    for (var prop in multiplyTargetCheckboxes) {
        multiplyTargetCheckboxes[prop].checked = true
    }
    updateCopyTargetString()

})

selectAllCopyTargets.addEventListener("dblclick", () => {
    for (var prop in multiplyTargetCheckboxes) {
        multiplyTargetCheckboxes[prop].checked = false
    }
    updateCopyTargetString()
})

for (var prop in multiplyTargetCheckboxes) {
    multiplyTargetCheckboxes[prop].addEventListener("input", updateCopyTargetString)
}


function updateCopyTargetString() {
    let string = ""
    let i = 1
    for (var prop in multiplyTargetCheckboxes) {
        if (multiplyTargetCheckboxes[prop].checked)
            string += `q${i} ,`
        i++
    }
    copyTargetsShower.innerHTML = `(${string.slice(0, -2)})`
}

updateCopyTargetString()

function changeCellBorderColor(color) {
    for (let i = 0; i < cells.length; i++) cells[i].style.borderColor = color
}

colorMatchThresholdSlider.addEventListener("input", () => {
    thresholdShower.innerHTML = `(${colorMatchThresholdSlider.value})`
})


rotateClockwise.onclick = () => {
    applyPaintData(rotateArray90Degrees(toPaintData2D(buffer.getItem().slice())).flat())
    recordPaintData()
}

// Pallette 
function getPaletteHTML(color, defaultPallette = false) {
    let classString = defaultPallette ? "default-pallette" : ""
    return `<div style="background:${color}" onclick="selectPalletteColor(this, '${color}')" class="${classString} pallate-color"></div>`
}

document.getElementById("extract-pallette").addEventListener("click", () => {
    let currentUniquePaintData = [...new Set(buffer.getItem())]
    for (let i = 0; i < currentUniquePaintData.length; i++) {
        let currentColor = rgbToHex(currentUniquePaintData[i].toLowerCase())
        if (!usedColors.includes(currentColor)) {
            pallateContainer.innerHTML += getPaletteHTML(currentColor)
            usedColors.push(currentColor)
        }
    }
})

function selectPalletteColor(palletteElem, color) {
    setPaletteCurrentColor(color)
    palletteElem.style.borderTopWidth = "5px"
}

function removePalletteSelectionHint() {
    for (let i = 0; i < pallateColors.length; i++) pallateColors[i].style.borderTopWidth = "1px"
}


for (let i = 0; i < defaultPalletteColors.length; i++) {
    pallateContainer.innerHTML += getPaletteHTML(defaultPalletteColors[i], true)
}

// input text color hex ...
id("color-selector-hex").addEventListener("input", function () {
    if (validateHex(this.value)) {
        setPaletteCurrentColor(this.value)
        colorSelector.value = this.value
    }
})

id("color-to-be-replaced-selector-hex").addEventListener("input", function () {
    if (validateHex(this.value)) {
        colorToBeReplacedSelector.value = this.value
        targetColor = this.value
    }
})

id("color-to-replace-with-selector-hex").addEventListener("input", function () {
    if (validateHex(this.value)) {
        colorToReplaceWithSelector.value = this.value
        replacementColor = this.value
    }
})

id("export-cell-border-selector-hex").addEventListener("input", function () {
    if (validateHex(this.value)) cellBorderColorSelector.value = this.value
})


function imageToPixelArtData(img, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = id("image-to-pixel-art-image-smoothening-enabled").checked
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const pixels = imageData.data;
    const pixelArtArray = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            let i = (y * w + x) * 4;
            row.push(rgbaToHex(`rgba(${pixels[i]}, ${pixels[i + 1]}, ${pixels[i + 2]},  ${pixels[i + 3] / 255})`))
        }
        pixelArtArray.push(row);
    }
    return pixelArtArray.flat();
}


deleteNonDefaultPallette.onclick = () => {
    customConfirm("Do you really want to delete all non-default pallette colors?", () => {
        usedColors = defaultPalletteColors.flat()
        let palletteElemsToDelete = []
        for (let i = 0; i < pallateContainer.children.length; i++)
            if (!pallateContainer.children[i].classList.contains("default-pallette"))
                palletteElemsToDelete.push(pallateContainer.children[i])
        for (let i = 0; i < palletteElemsToDelete.length; i++)
            pallateContainer.removeChild(palletteElemsToDelete[i])
    })
}



function colorDataToImage(colors, borderWidth, borderColor, mini = false, res = 1024) {
    // Calculate the dimensions of the canvas
    const canvasWidth = colors[0].length;
    const canvasHeight = colors.length;
    // Create a new canvas element
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    let resW, resH
    if (canvasWidth > canvasHeight) {
        resW = res
        resH = res * (canvasHeight / canvasWidth)
    } else {
        resH = res
        resW = res * (canvasWidth / canvasHeight)
    }
    // Get the canvas context and create an ImageData object
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(canvasWidth, canvasHeight);
    // Loop through each pixel in the ImageData object and set its color from the 2D array
    for (let i = 0; i < imageData.data.length; i += 4) {
        // Calculate the x and y position of the pixel
        const x = (i / 4) % canvasWidth;
        const y = Math.floor(i / (4 * canvasWidth));

        // Get the color of the corresponding cell in the 2D array
        const color = colors[y][x];
        // Convert the color from hex to RGB
        const r = parseInt(color.substring(1, 3), 16);
        const g = parseInt(color.substring(3, 5), 16);
        const b = parseInt(color.substring(5, 7), 16);
        let a = parseInt(color.substring(7, 9), 16);
        if (isNaN(a)) a = 255
        // Set the pixel color in the ImageData object
        imageData.data[i] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
        imageData.data[i + 3] = a;
    }

    // Put the ImageData onto the canvas
    ctx.putImageData(imageData, 0, 0);
    if (mini) return canvas.toDataURL()
    // Scale the canvas up to res X res
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = resW;
    scaledCanvas.height = resH;

    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(canvas, 0, 0, resW, resH);
    let cellSize = resH / colors.length
    // If there is a border, draw it onto the final canvas
    scaledCtx.lineWidth = borderWidth;
    scaledCtx.strokeStyle = borderColor;
    if (borderWidth > 0) {
        for (let y = 0; y < colors.length; y++) {
            for (let x = 0; x < colors[y].length; x++) {
                if (colors[y][x] != "#00000000" || cellBorderOnTransparentCellsCheckbox.checked)
                    scaledCtx.strokeRect(x * cellSize + borderWidth / 2, y * cellSize + borderWidth / 2, cellSize - borderWidth, cellSize - borderWidth);
            }
        }
    }
    return scaledCanvas.toDataURL();

}


setupNumInputWithButtons(id("minus-rw-count"), id("plus-rw-count"), id("fixed-rect-width"), 1, 1, false)
setupNumInputWithButtons(id("minus-rh-count"), id("plus-rh-count"), id("fixed-rect-height"), 1, 1, false)
setupNumInputWithButtons(id("m-f-radius"), id("p-f-radius"), id("fixed-radius-value"), 1, 1, false)


id("top-reload").onclick = () => {
    customConfirm("Do You Want To Reload?", () => {
        window.location.reload()
    })
}
id("top-reload").ondblclick = () => window.location.reload()