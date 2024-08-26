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

const VERSION = "v.2024.009"
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
setCurrentColor(localStorageREF[B_COLOR] || "#334470")
let chooseColorRandomly = false
let rows = 10,
    cols = 10
let menuSegmentLocations = []

guideCellBorderColor.value = "#" + borderColor

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

function gotoTab(tabName, scollIntoView = false) {
    if (scollIntoView) bottomControls.scrollIntoView()
    redirectMenuViewTo(tabLocations[tabName] * controlWidth)
}

for (let i = 0; i < menuNav.children.length; i++) {
    menuNav.children[i].addEventListener("click", () => {
        redirectMenuViewTo(i * controlWidth)
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
    for (let i = 0; i < paintCells.length; i++) {
        data.push(window.getComputedStyle(paintCells[i]).getPropertyValue('background-color'))
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
                    id("info-fill-rule").textContent = "fill rule off,"
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
        for (var i = 0; i < paintCells.length; i++) {
            paintCells[i].style.background = data[i]
        }
        return
    }
    for (var i = 0; i < paintCells.length; i++) {
        setCellColor(paintCells[i], data[i])
    }
}


function addCanvas(argRows, argCols, clearStack = true) {
    rows = argRows
    cols = argCols
    id("info-size").textContent = `c${cols}:r${rows},`
    if (clearStack)
        buffer.clearStack()
    paintZone.innerHTML = ""
    let HTML = ' <div id="selection-shower"></div>'
    let i = 0
    let elemWidth = parseFloat(getComputedStyle(paintZone).getPropertyValue("width")) / window.innerWidth * 100 / cols
    while (i < rows * cols) {
        HTML += `<div class="cell"></div>`
        i++
    }
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
    for (let i = 0; i < paintCells.length; i++) {
        paintCells[i].onclick = function () {
            lineInfoShower.textContent = `y:${Math.floor(i / cols)},x:${i % cols},`
            if (colorSelectionInProgress) {
                let fullColor = rgbToHex(buffer.getItem()[i])
                let selectedColor = fullColor.slice(0, 7)
                changeCellBorderColor(borderColor)
                if (clickManagerCheckboxes.selectColorForFind.checked) {
                    colorToBeReplacedSelector.value = selectedColor
                    targetColor = selectedColor
                    clickManagerCheckboxes.selectColorForFind.checked = false
                } else if (clickManagerCheckboxes.colorSelectCheckbox.checked) {
                    setCurrentColor(selectedColor)
                    clickManagerCheckboxes.colorSelectCheckbox.checked = false
                } else if (clickManagerCheckboxes.selectColorForReplacer.checked) {
                    colorToReplaceWithSelector.value = selectedColor
                    replacementColor = selectedColor
                    clickManagerCheckboxes.selectColorForReplacer.checked = false
                } else if (clickManagerCheckboxes.pasteOnClick.checked) {
                    let y = Math.floor(i / cols)
                    let x = i % cols
                    if (!selectedPart) return
                    let paintCells2d = []
                    for (let i = 0; i < paintCells.length; i++) paintCells2d.push(paintCells[i])
                    paintCells2d = toPaintData2D(paintCells2d);
                    paste(
                        x + selectedPart[0].length,
                        y + selectedPart.length,
                        selectedPart,
                        paintCells2d
                    )
                    recordPaintData()
                } else if (clickManagerCheckboxes.copyColorFromCellCheckbox.checked) {
                    copyTextToClipboard(selectedColor);
                    copiedColorShower.innerHTML = `If Color Wasn't Copied, Copy Manually: <span class="color">${selectedColor}</span> <span style="user-select:none; color: ${selectedColor}; background: ${selectedColor}; border: 0.5px solid var(-secondary)" >!!!!</span>`
                    clickManagerCheckboxes.copyColorFromCellCheckbox.checked = false
                } else if (clickManagerCheckboxes.selectHueFromCell.checked) {
                    clickManagerCheckboxes.selectHueFromCell.checked = false
                    hueAngle.value = getHSLFromHex(selectedColor).hue
                    hue = parseFloat(hueAngle.value)
                    updateHueShower()
                    updateHueColorShower()

                } else if (clickManagerCheckboxes.selectLightingFromCell.checked) {
                    // LIGHTING
                    clickManagerCheckboxes.selectLightingFromCell.checked = false
                    lightingSlider.value = getHSLFromHex(selectedColor).lightness * 100
                    updateHueColorShower()

                    lightingShower.innerHTML = `(${lightingSlider.value}%)`
                } else if (clickManagerCheckboxes.selectSaturationFromCell.checked) {
                    // SATURATION
                    clickManagerCheckboxes.selectSaturationFromCell.checked = false
                    saturationSlider.value = getHSLFromHex(selectedColor).saturation * 100
                    saturationShower.innerHTML = `(${saturationSlider.value}%)`
                    updateHueColorShower()

                } else if (clickManagerCheckboxes.selectForOnlyFillIf.checked) {
                    if (fillOnlyThisColor.value)
                        fillOnlyThisColor.value += "||"
                    fillOnlyThisColor.value += selectedColor
                    clickManagerCheckboxes.selectForOnlyFillIf.checked = false
                } else if (clickManagerCheckboxes.selectColorForPaletteCreator.checked) {
                    paletteCreatorPalette.selected.style.background = selectedColor
                    clickManagerCheckboxes.selectColorForPaletteCreator.checked = false
                } else if (clickManagerCheckboxes.onclickFillCol.checked) {
                    let colToPaint = i % cols
                    let newData = toPaintData2D(buffer.getItem().slice())
                    for (let i = 0; i < newData.length; i++) newData[i][colToPaint] = getCurrentSelectedColor()
                    applyPaintData(newData.flat(), false)
                } else if (clickManagerCheckboxes.onclickFillRow.checked) {
                    let rowToPaint = Math.floor(i / cols);
                    let newData = toPaintData2D(buffer.getItem().slice())
                    let rowArray = []
                    for (let i = 0; i < cols; i++) rowArray.push(getCurrentSelectedColor())
                    newData[rowToPaint] = rowArray
                    applyPaintData(newData.flat(), false)
                }
                recordPaintData()
                colorSelectionInProgress = false
                colorSelectionInProgress = clickManagerCheckboxes.pasteOnClick.checked ||
                    clickManagerCheckboxes.onclickFillRow.checked ||
                    clickManagerCheckboxes.onclickFillCol.checked
            } else if (clickModeSelector.value == "row") {
                let rowToPaint = Math.floor(i / cols);
                let newData = toPaintData2D(buffer.getItem().slice())
                let rowArray = []
                for (let i = 0; i < cols; i++) rowArray.push(getCurrentSelectedColor())
                newData[rowToPaint] = rowArray
                applyPaintData(newData.flat(), false)
                recordPaintData()
            } else if (clickModeSelector.value == "col") {
                let colToPaint = i % cols
                let newData = toPaintData2D(buffer.getItem().slice())
                for (let i = 0; i < newData.length; i++) newData[i][colToPaint] = getCurrentSelectedColor()
                applyPaintData(newData.flat(), false)
                recordPaintData()
            } else if (clickModeSelector.value == "fill") {
                applyPaintData(floodFill(toPaintData2D(buffer.getItem()), i % cols, Math.floor(i / cols)).flat())
                recordPaintData()
            }
            else {
                setCellColor(this, getCurrentSelectedColor())
                recordPaintData()
            }


        }
        paintCells[i].style.borderColor = borderColor
    }
    recordPaintData()
    if (guideCheckbox.checked) addGuides()
    if (!borderCheckbox.checked) removeBorder()

}

colorSelector.addEventListener("input", function () {
    setCurrentColor(this.value)
})


function setCurrentColor(color) {
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
let colorSelectionInProgress = false
for (let colorCopierCheckbox in clickManagerCheckboxes) {
    clickManagerCheckboxes[colorCopierCheckbox].oninput = function () {
        if (!this.checked) {
            changeCellBorderColor(borderColor)
            colorSelectionInProgress = false
            return
        }
        colorSelectionInProgress = true
        for (let colorCopierCheckbox in clickManagerCheckboxes) clickManagerCheckboxes[colorCopierCheckbox].checked = false
        this.checked = true
        changeCellBorderColor("red")
    }
}


// END

guideCellBorderColor.addEventListener("input", function () {
    borderColor = this.value
    for (var i = 0; i < paintCells.length; i++) {
        paintCells[i].style.borderColor = borderColor
    }
})

setUpLocalStorageBucket("bitmacr_border", "1")
execBucket("bitmacr_border", "0", () => {
    removeBorder()
    borderCheckbox.checked = false
    guideCellBorder2.checked = false
})

borderCheckbox.addEventListener("input", handleGuideBorderVisibility)
guideCellBorder2.addEventListener("input", handleGuideBorderVisibility)

guideCheckbox.addEventListener("input", handleQuadrandGuideClick)
guideCheckbox2.addEventListener("input", handleQuadrandGuideClick)

function handleGuideBorderVisibility() {
    sessions[currentSession].updateBorderStatus(this.checked)
    updateBorderStatus(this.checked)
}


function updateBorderStatus(borderStatus) {
    borderCheckbox.checked = borderStatus
    guideCellBorder2.checked = borderStatus
    if (borderStatus) {
        localStorageREF.setItem("bitmacr_border", "1")

        for (var i = 0; i < paintCells.length; i++) {
            paintCells[i].style.borderWidth = '0.5px'
        }
    } else {
        localStorageREF.setItem("bitmacr_border", "0")
        for (var i = 0; i < paintCells.length; i++) {
            paintCells[i].style.borderWidth = '0'
        }
    }
    if (guideCheckbox.checked) addGuides()
}

function handleQuadrandGuideClick() {
    guideCheckbox.checked = this.checked
    guideCheckbox2.checked = this.checked
    if (this.checked) {
        addGuides()
    } else {
        if (borderCheckbox.checked) {
            for (var i = 0; i < paintCells.length; i++) {
                paintCells[i].style.border = `0.5px solid ${borderColor}`
            }
        } else {
            for (var i = 0; i < paintCells.length; i++) {
                paintCells[i].style.border = `0 solid ${borderColor}`
            }
        }
    }
}



function addGuides() {
    if (cols % 2 == 1) {
        let paintCells2d = []
        for (let i = 0; i < paintCells.length; i++)
            paintCells2d.push(paintCells[i])
        paintCells2d = toPaintData2D(paintCells2d)
        for (let i = 0; i < paintCells2d.length; i++) {
            let middleElementIndex = (paintCells2d[i].length - 1) / 2
            paintCells2d[i][middleElementIndex].style.borderRight = `1px dashed ${borderColor}`
            paintCells2d[i][middleElementIndex].style.borderLeft = `1px dashed ${borderColor}`
        }
        let middlePaintCellsArray = paintCells2d[(paintCells2d.length - 1) / 2]
        for (let i = 0; i < middlePaintCellsArray.length; i++) {
            middlePaintCellsArray[i].style.borderTop = `1px dashed ${borderColor}`
            middlePaintCellsArray[i].style.borderBottom = `1px dashed ${borderColor}`
        }
        return
    }
    for (var i = 0; i < paintCells.length; i += (cols / 2)) {
        paintCells[i].style.borderLeft = `1px dashed ${borderColor}`
    }
    let j = 0;
    for (var i = (cols * (cols / 2)); i < paintCells.length; i++) {
        paintCells[i].style.borderTop = `1px dashed ${borderColor}`
        j++
        if (j == cols) break
    }
}


function removeBorder() {
    for (var i = 0; i < paintCells.length; i++) {
        paintCells[i].style.borderWidth = '0'
    }
}


cellBorderWidthSlider.addEventListener("input", () => {
    cellBorderWidthShower.innerHTML = `(${cellBorderWidthSlider.value})`
})

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




replaceButton.onclick = replace


function replace(ignore) {
    for (let i = 0; i < paintCells.length; i++) {
        let currentColor = rgbToHex(getComputedStyle(paintCells[i]).getPropertyValue("background-color"))
        if (matchHexColors(targetColor, currentColor, colorMatchThresholdSlider.value))
            setCellColor(paintCells[i], replaceWithNormalCheckbox.checked ? getCurrentSelectedColor() : replacementColor)
    }
    recordPaintData()
}

function changeCellBorderColor(color) {
    for (let i = 0; i < paintCells.length; i++) {
        paintCells[i].style.borderColor = color
    }
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
    setCurrentColor(color)
    palletteElem.style.borderTopWidth = "5px"
}

function removePalletteSelectionHint() {
    for (let i = 0; i < pallateColors.length; i++) {
        pallateColors[i].style.borderTopWidth = "1px"
    }
}


for (let i = 0; i < defaultPalletteColors.length; i++) {
    pallateContainer.innerHTML += getPaletteHTML(defaultPalletteColors[i], true)
}

// input text color hex ...
id("color-selector-hex").addEventListener("input", function () {
    if (validateHex(this.value)) {
        setCurrentColor(this.value)
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

id("guide-cell-border-selector-hex").addEventListener("input", function () {
    if (validateHex(this.value)) {
        guideCellBorderColor.value = this.value
        borderColor = this.value
        changeCellBorderColor(this.value)
    }
})

id("export-cell-border-selector-hex").addEventListener("input", function () {
    if (validateHex(this.value)) {
        cellBorderColorSelector.value = this.value
    }
})


function imageToPixeArtData(image, width, height) {
    // create a new canvas element
    const canvas = document.createElement('canvas');

    // set the canvas dimensions to match the desired dimensions
    canvas.width = width;
    canvas.height = height;

    // get the canvas context
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = document.getElementById("image-to-pixel-art-image-smoothening-enabled").checked
    // draw the image on the canvas
    context.drawImage(image, 0, 0, width, height);

    // get the pixel data from the canvas
    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // create a 2D array to hold the pixel data with hex color values
    const pixelArray = [];

    // loop through the pixels and create a 2D array of hex color values
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];

            // convert the RGB values to a hex color value
            const hexColor = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
            row.push("#" + hexColor);
        }
        pixelArray.push(row);
    }

    // return the 2D array of pixel data with hex color values
    return pixelArray.flat();
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
    // Scale the canvas up to resXres
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = resW;
    scaledCanvas.height = resH;

    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(canvas, 0, 0, resW, resH);
    let cellSize = resH / colors.length
    // If there is a border, draw it onto the final canva
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
    window.location.reload()
}